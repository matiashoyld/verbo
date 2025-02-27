import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { extractSkillsFromJobDescription, generateAssessmentCase } from "~/lib/gemini";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

// Types for the structured data format we send to the AI
interface StructuredCategory {
  name: string;
  numId?: number | null;
  skills: Array<{
    name: string;
    numId?: number | null;
    competencies: Array<{
      name: string;
      numId?: number | null;
    }>;
  }>;
}

interface StructuredData {
  categories: StructuredCategory[];
}

export const positionsRouter = createTRPCRouter({
  // Debug procedure to check auth state
  checkAuth: publicProcedure.query(async ({ ctx }) => {
    try {
      return {
        isAuthenticated: !!ctx.userId,
        userId: ctx.userId,
        // Don't return the actual user ID in production
        userIdPreview: ctx.userId ? `${ctx.userId.substring(0, 4)}...` : null,
      };
    } catch (error) {
      console.error("Error checking auth:", error);
      return {
        isAuthenticated: false,
        error: "Failed to check authentication state",
      };
    }
  }),

  getCommonPositions: publicProcedure.query(async ({ ctx }) => {
    // Use direct SQL query to avoid Prisma model capitalization issues
    const positions = await ctx.db.$queryRaw`
      SELECT * FROM "CommonPosition" ORDER BY title ASC
    `;
    return positions;
  }),

  // Add a debug endpoint to test the AI extraction with verbose logging
  debugExtractSkills: publicProcedure
    .input(
      z.object({
        jobDescription: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("DEBUG: Starting skill extraction with verbose logging");
        
        // Get all database data in structured format
        const dbData = await fetchCompleteSkillsData(ctx.db);
        
        // Extract skills using the Gemini AI service - this will produce verbose logs
        const result = await extractSkillsFromJobDescription(
          input.jobDescription,
          dbData
        );
        
        // Return both the result and metadata for reference
        return {
          result,
          inputLength: input.jobDescription.length,
          inputPreview: input.jobDescription.substring(0, 200) + "...",
          categoryCount: dbData.categories.length,
          skillCount: dbData.categories.reduce(
            (count: number, cat: StructuredCategory) => count + cat.skills.length, 
            0
          ),
        };
      } catch (error) {
        console.error("DEBUG: Error in extractSkills procedure:", error);
        throw error;
      }
    }),

  extractSkills: publicProcedure
    .input(
      z.object({
        jobDescription: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Extracting skills for job description:", input.jobDescription.substring(0, 100) + "...");
        
        // Get complete skills data including all categories, skills and competencies
        const dbData = await fetchCompleteSkillsData(ctx.db);
        
        console.log(`Found ${dbData.categories.length} categories with ${
          dbData.categories.reduce(
            (count: number, cat: StructuredCategory) => count + cat.skills.length, 
            0
          )
        } skills and ${
          dbData.categories.reduce(
            (count: number, cat: StructuredCategory) => 
              count + cat.skills.reduce(
                (sCount: number, skill: { competencies: Array<{ name: string }> }) => 
                  sCount + skill.competencies.length, 
                0
              ), 
            0
          )
        } total competencies`);
        
        // Extract skills using the Gemini AI service
        const result = await extractSkillsFromJobDescription(
          input.jobDescription,
          dbData
        );
        
        console.log("Skills extracted successfully");
        return result;
      } catch (error) {
        console.error("Error in extractSkills procedure:", error);
        
        // Return a fallback result in case of error
        return {
          categories: [
            {
              name: "Programming",
              skills: [
                {
                  name: "JavaScript",
                  competencies: [
                    { name: "DOM Manipulation", selected: true },
                    { name: "ES6+ Features", selected: true },
                    { name: "Asynchronous Patterns", selected: true },
                  ],
                },
                {
                  name: "TypeScript",
                  competencies: [
                    { name: "Type Definitions", selected: true },
                    { name: "Advanced Types", selected: true },
                  ],
                },
              ],
            },
            {
              name: "Frontend",
              skills: [
                {
                  name: "React",
                  competencies: [
                    { name: "Hooks", selected: true },
                    { name: "Context API", selected: true },
                    { name: "State Management", selected: true },
                  ],
                },
              ],
            },
          ],
        };
      }
    }),

  getAllSkillsAndCategories: publicProcedure
    .query(async ({ ctx }) => {
      try {
        // Get all skills with their categories
        const skills = await ctx.db.skill.findMany({
          select: {
            id: true,
            name: true,
            numId: true,
            category: {
              select: {
                name: true,
                numId: true,
              },
            },
            // Get the associated competencies
            competencies: {
              select: {
                name: true,
                numId: true,
              },
            },
          },
        });

        // Transform the data into the format expected by the frontend
        const transformedData = skills.map((skill) => ({
          skillName: skill.name,
          skillNumId: skill.numId,
          categoryName: skill.category.name,
          categoryNumId: skill.category.numId,
          competencies: skill.competencies.map((competency) => ({
            name: competency.name,
            numId: competency.numId,
          })),
        }));

        return transformedData;
      } catch (error) {
        console.error("Error fetching skills and categories:", error);
        // Return some fallback data
        return [
          {
            skillName: "JavaScript",
            skillNumId: 1,
            categoryName: "Programming",
            categoryNumId: 1,
            competencies: [
              { name: "DOM Manipulation", numId: 1 },
              { name: "ES6+ Features", numId: 2 },
              { name: "Asynchronous Patterns", numId: 3 }
            ]
          },
          {
            skillName: "TypeScript",
            skillNumId: 2,
            categoryName: "Programming",
            categoryNumId: 1,
            competencies: [
              { name: "Type Definitions", numId: 4 },
              { name: "Advanced Types", numId: 5 }
            ]
          },
          {
            skillName: "React",
            skillNumId: 3,
            categoryName: "Frontend",
            categoryNumId: 2,
            competencies: [
              { name: "Hooks", numId: 6 },
              { name: "Context API", numId: 7 },
              { name: "State Management", numId: 8 }
            ]
          }
        ];
      }
    }),

  generateAssessment: publicProcedure
    .input(
      z.object({
        jobDescription: z.string(),
        skills: z.array(
          z.object({
            category: z.string(),
            categoryNumId: z.number().nullable().optional(),
            skills: z.array(
              z.object({
                name: z.string(),
                numId: z.number().nullable().optional(),
                competencies: z.array(
                  z.object({
                    name: z.string(),
                    numId: z.number().nullable().optional(),
                    selected: z.boolean(),
                  })
                ),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("Generating assessment case for job description:", input.jobDescription.substring(0, 50) + "...");
        
        // Transform the input skills to match the expected format
        const transformedSkills = {
          categories: input.skills.map(category => ({
            name: category.category,
            numId: category.categoryNumId,
            skills: category.skills.map(skill => ({
              name: skill.name,
              numId: skill.numId,
              competencies: skill.competencies
            }))
          }))
        };
        
        // Call the Gemini function to generate the assessment
        const assessmentCase = await generateAssessmentCase(
          input.jobDescription,
          transformedSkills
        );
        
        return assessmentCase;
      } catch (error) {
        console.error("Error in generateAssessment procedure:", error);
        throw new Error("Failed to generate assessment case");
      }
    }),

  createPosition: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        jobDescription: z.string(),
        skills: z.array(
          z.object({
            category: z.string(),
            categoryNumId: z.number().nullable().optional(),
            skills: z.array(
              z.object({
                name: z.string(),
                numId: z.number().nullable().optional(),
                competencies: z.array(
                  z.object({
                    name: z.string(),
                    numId: z.number().nullable().optional(),
                    selected: z.boolean(),
                  })
                ),
              })
            ),
          })
        ),
        assessment: z.object({
          title: z.string(),
          context: z.string(),
          questions: z.array(
            z.object({
              context: z.string(),
              question: z.string(),
              skills_assessed: z.array(
                z.object({
                  numId: z.number().optional(),
                  name: z.string(),
                })
              ),
            })
          ),
          _internal: z.object({
            competencyIdMap: z.record(z.string(), z.object({
              numId: z.number(),
              categoryNumId: z.number().nullable(),
              skillNumId: z.number().nullable(),
            }))
          }).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Creating position with userId:", ctx.userId);
        
        // Use the current user's ID directly instead of hardcoded IDs
        const creatorId = ctx.userId;
        
        console.log("Using creator ID:", creatorId);
        
        // Create the position record using SQL with proper type casting
        const positionResult = await ctx.db.$queryRaw<Array<{id: string}>>`
          INSERT INTO "Position" (
            id, title, "jobDescription", context, openings, "creator_id", "created_at", "updated_at"
          ) VALUES (
            gen_random_uuid(), ${input.title}, ${input.jobDescription}, 
            ${input.assessment.context}, 1, ${creatorId}, NOW(), NOW()
          ) RETURNING id
        `;
        
        // Add null check and provide an explicit error
        if (!positionResult || positionResult.length === 0) {
          throw new Error("Failed to create position record");
        }
        
        // Define a default ID in case of error
        const positionId = positionResult[0]?.id || (() => { 
          throw new Error("Failed to get position ID after creation"); 
        })();
        
        // Create position questions and associate competencies
        for (const question of input.assessment.questions) {
          // Insert the question without the skills_assessed field
          const questionResult = await ctx.db.$queryRaw<Array<{id: string}>>`
            INSERT INTO "PositionQuestion" (
              id, "position_id", question, context, "created_at", "updated_at"
            ) VALUES (
              gen_random_uuid(), ${positionId}::uuid, ${question.question}, ${question.context}, 
              NOW(), NOW()
            ) RETURNING id
          `;
          
          if (questionResult && questionResult.length > 0 && questionResult[0]) {
            const questionId = questionResult[0].id;
            
            // Process skills for the question
            try {
              if (question.skills_assessed && question.skills_assessed.length > 0) {
                console.log(`Processing ${question.skills_assessed.length} skills for question ${questionId}`);
                
                // Statistics tracking
                let directMatches = 0;
                let failed = 0;
                let missingNumIds = 0;
                
                // Process each skill
                for (const skill of question.skills_assessed) {
                  try {
                    let competencyId = null;
                    
                    // Skip negative numIds (these are our fallbacks from the generateFallbackId function)
                    if (skill.numId !== null && skill.numId !== undefined) {
                      if (skill.numId < 0) {
                        console.warn(`Skipping fallback numId ${skill.numId} for "${skill.name}" - this is not a real database ID`);
                        missingNumIds++;
                        continue;
                      }
                      
                      // Look up the competency by its numId (which should match the Competency.num_id column)
                      const competencies = await ctx.db.$queryRaw<[{ id: string }]>`
                        SELECT id FROM "Competency" WHERE "num_id" = ${skill.numId}::int LIMIT 1
                      `;
                      
                      if (competencies && competencies.length > 0 && competencies[0]) {
                        competencyId = competencies[0].id;
                        directMatches++;
                        console.log(`✓ Direct numId match for "${skill.name}" using numId: ${skill.numId}`);
                      } else {
                        console.warn(`✗ No competency found with numId: ${skill.numId} for "${skill.name}"`);
                        failed++;
                      }
                    } else {
                      console.warn(`✗ Skill "${skill.name}" has no numId`);
                      missingNumIds++;
                    }
                    
                    // If we found a competency, create the association
                    if (competencyId) {
                      await ctx.db.$executeRaw`
                        INSERT INTO "QuestionCompetency" (
                          id, "question_id", "competency_id", "created_at", "updated_at"
                        ) VALUES (
                          gen_random_uuid(), ${questionId}::uuid, ${competencyId}::uuid, NOW(), NOW()
                        )
                      `;
                    } else {
                      console.warn(`✗ Failed to find competency for "${skill.name}"`);
                      failed++;
                    }
                  } catch (error) {
                    console.error(`Error processing skill "${skill.name}":`, error);
                    failed++;
                  }
                }
                
                // Log summary statistics for this question
                console.log(`Question competency matching: 
- ${directMatches} direct matches (${Math.round((directMatches)/(question.skills_assessed.length)*100 || 0)}%)
- ${failed} failed matches
- ${missingNumIds} skills with missing or invalid numIds`);
              }
            } catch (error) {
              console.error(`Error processing skills for question ${questionId}:`, error);
            }
          }
        }

        return { success: true, positionId };
      } catch (error) {
        console.error("Error creating position:", error);
        throw new Error("Failed to create position");
      }
    }),

  getPositions: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Use raw SQL query to avoid Prisma model capitalization issue
      const positions = await ctx.db.$queryRaw<Array<{
        id: string;
        title: string;
        created_at: Date;
        question_count: number;
      }>>`
        SELECT 
          p.id, 
          p.title, 
          p.created_at,
          COUNT(pq.id) as question_count
        FROM "Position" p
        LEFT JOIN "PositionQuestion" pq ON p.id = pq.position_id
        GROUP BY p.id, p.title, p.created_at
        ORDER BY p.created_at DESC
      `;

      // Transform the results to match the expected interface
      return positions.map(position => ({
        id: position.id,
        title: position.title,
        created: formatRelativeTime(position.created_at),
        createdAt: position.created_at.toISOString(),
        questionCount: Number(position.question_count)
      }));
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  }),

  deletePosition: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Start a transaction to ensure all related data is deleted
        return await ctx.db.$transaction(async (tx) => {
          // 1. Find all PositionQuestions related to this position
          const positionQuestions = await tx.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM "PositionQuestion" WHERE position_id = ${input.id}::uuid
          `;

          const positionQuestionIds = positionQuestions.map(pq => pq.id);

          // 2. Delete all QuestionCompetency records related to these questions
          if (positionQuestionIds.length > 0) {
            // Use a parameterized query approach for handling the UUIDs
            for (const questionId of positionQuestionIds) {
              await tx.$executeRaw`
                DELETE FROM "QuestionCompetency" 
                WHERE question_id = ${questionId}::uuid
              `;
            }
          }

          // 3. Delete all PositionQuestion records for this position
          await tx.$executeRaw`
            DELETE FROM "PositionQuestion" WHERE position_id = ${input.id}::uuid
          `;

          // 4. Delete the Position itself
          await tx.$executeRaw`
            DELETE FROM "Position" WHERE id = ${input.id}::uuid
          `;

          return { success: true, message: "Position deleted successfully" };
        });
      } catch (error) {
        console.error("Error deleting position:", error);
        throw new Error("Failed to delete position and its associated data");
      }
    }),

  getPositionById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Fetch the position
        const position = await ctx.db.$queryRaw<Array<{
          id: string;
          title: string;
          job_description: string;
          context: string;
          created_at: Date;
        }>>`
          SELECT id, title, "jobDescription" as job_description, context, created_at
          FROM "Position" 
          WHERE id = ${input.id}::uuid
        `;

        if (!position || position.length === 0) {
          throw new Error("Position not found");
        }

        // Now we know position[0] exists
        const positionData = position[0]!;

        // Fetch the questions for this position
        const questions = await ctx.db.$queryRaw<Array<{
          id: string;
          question: string;
          context: string;
        }>>`
          SELECT id, question, context
          FROM "PositionQuestion"
          WHERE position_id = ${input.id}::uuid
          ORDER BY created_at ASC
        `;

        // For each question, fetch associated skills/competencies
        const questionsWithSkills = await Promise.all(
          questions.map(async (question) => {
            const skills = await ctx.db.$queryRaw<Array<{
              name: string;
              num_id: number | null;
            }>>`
              SELECT ss.name, ss.num_id
              FROM "QuestionCompetency" qc
              JOIN "Competency" ss ON qc.competency_id = ss.id
              WHERE qc.question_id = ${question.id}::uuid
            `;

            return {
              ...question,
              skills: skills.map(skill => ({
                name: skill.name,
                numId: skill.num_id
              }))
            };
          })
        );

        return {
          id: positionData.id,
          title: positionData.title,
          jobDescription: positionData.job_description,
          context: positionData.context || "",
          createdAt: positionData.created_at.toISOString(),
          questions: questionsWithSkills
        };
      } catch (error) {
        console.error("Error fetching position by ID:", error);
        throw error;
      }
    }),

  updatePositionQuestions: protectedProcedure
    .input(z.object({
      positionId: z.string(),
      questions: z.array(z.object({
        id: z.string().optional(), // Optional for new questions
        question: z.string(),
        context: z.string().optional(),
        skills: z.array(z.object({
          name: z.string(),
          numId: z.number().nullable(),
        })).optional(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Start a transaction to ensure data consistency
        return await ctx.db.$transaction(async (tx) => {
          // Get current questions for this position to compare
          const currentQuestions = await tx.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM "PositionQuestion" 
            WHERE position_id = ${input.positionId}::uuid
          `;
          
          const currentQuestionIds = new Set(currentQuestions.map(q => q.id));
          const updatedQuestionIds = new Set(
            input.questions
              .filter(q => q.id) // Filter out questions without IDs (new ones)
              .map(q => q.id as string)
          );
          
          // Find questions to delete (in current but not in updated)
          const questionsToDelete = [...currentQuestionIds].filter(
            id => !updatedQuestionIds.has(id)
          );
          
          // Delete questions that are no longer in the list
          for (const questionId of questionsToDelete) {
            // First delete associated competencies
            await tx.$executeRaw`
              DELETE FROM "QuestionCompetency" 
              WHERE question_id = ${questionId}::uuid
            `;
            
            // Then delete the question itself
            await tx.$executeRaw`
              DELETE FROM "PositionQuestion" 
              WHERE id = ${questionId}::uuid
            `;
          }
          
          // Update existing questions and add new ones
          for (let index = 0; index < input.questions.length; index++) {
            const q = input.questions[index]!;
            
            if (q.id && currentQuestionIds.has(q.id)) {
              // This is an existing question - update it
              await tx.$executeRaw`
                UPDATE "PositionQuestion"
                SET 
                  question = ${q.question},
                  context = ${q.context || ""},
                  position_index = ${index}
                WHERE id = ${q.id}::uuid
              `;
              
              // Update competencies: First remove all existing ones
              await tx.$executeRaw`
                DELETE FROM "QuestionCompetency" 
                WHERE question_id = ${q.id}::uuid
              `;
            } else {
              // This is a new question - insert it
              const newQuestion = await tx.$queryRaw<[{ id: string }]>`
                INSERT INTO "PositionQuestion" (
                  position_id, question, context, position_index
                ) VALUES (
                  ${input.positionId}::uuid, 
                  ${q.question}, 
                  ${q.context || ""}, 
                  ${index}
                )
                RETURNING id
              `;
              
              // Use the new question ID for competency linking
              q.id = newQuestion[0]?.id;
            }
            
            // Add new competencies for the question
            if (q.id && q.skills && q.skills.length > 0) {
              for (const skill of q.skills) {
                // Find the competency ID from numId if available
                if (skill.numId !== null) {
                  const competency = await tx.$queryRaw<[{ id: string }]>`
                    SELECT id FROM "Competency" WHERE num_id = ${skill.numId}
                  `;
                  
                  if (competency && competency[0]) {
                    await tx.$executeRaw`
                      INSERT INTO "QuestionCompetency" (
                        question_id, competency_id
                      ) VALUES (
                        ${q.id}::uuid, ${competency[0].id}::uuid
                      )
                    `;
                  }
                }
              }
            }
          }
          
          return { success: true, message: "Position questions updated successfully" };
        });
      } catch (error) {
        console.error("Error updating position questions:", error);
        throw new Error("Failed to update position questions");
      }
    }),

  // Public procedure to get position by ID for candidate view
  getPositionByIdPublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Fetch the position with creator information
        const position = await ctx.db.$queryRaw<Array<{
          id: string;
          title: string;
          job_description: string;
          context: string;
          created_at: Date;
          creator_id: string;
          creator_name: string | null;
        }>>`
          SELECT 
            p.id, 
            p.title, 
            p."jobDescription" as job_description, 
            p.context, 
            p.created_at,
            p.creator_id,
            u.name as creator_name
          FROM "Position" p
          LEFT JOIN "User" u ON p.creator_id = u.id
          WHERE p.id = ${input.id}::uuid
        `;

        if (!position || position.length === 0) {
          return null; // Return null instead of throwing an error
        }

        // Now we know position[0] exists
        const positionData = position[0]!;

        // Fetch the questions for this position
        const questions = await ctx.db.$queryRaw<Array<{
          id: string;
          question: string;
          context: string;
        }>>`
          SELECT id, question, context
          FROM "PositionQuestion"
          WHERE position_id = ${input.id}::uuid
          ORDER BY created_at ASC
        `;

        // Return formatted position data
        return {
          id: positionData.id,
          title: positionData.title,
          jobDescription: positionData.job_description,
          context: positionData.context,
          createdAt: positionData.created_at.toISOString(),
          creatorId: positionData.creator_id,
          creatorName: positionData.creator_name,
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            context: q.context,
          })),
        };
      } catch (error) {
        console.error("Error fetching position by ID (public):", error);
        return null;
      }
    }),
});

/**
 * Helper function to fetch complete skills data from the database
 * for use with the indexing approach of the AI
 */
async function fetchCompleteSkillsData(db: PrismaClient): Promise<StructuredData> {
  // Get all categories with numIds
  const categories = await db.category.findMany({
    select: {
      id: true,
      numId: true,
      name: true,
    },
  });

  // Get all skills with their categories and competencies
  const skills = await db.skill.findMany({
    select: {
      id: true,
      numId: true,
      name: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          numId: true,
          name: true,
        },
      },
      competencies: {
        select: {
          id: true,
          numId: true,
          name: true,
        },
      },
    },
  });

  // Build a nested structure that matches what our AI function expects
  const structuredData: StructuredData = {
    categories: categories.map((category) => {
      // Find all skills that belong to this category
      const categorySkills = skills.filter((skill) => 
        skill.categoryId === category.id
      );
      
      return {
        name: category.name,
        numId: category.numId,
        skills: categorySkills.map((skill) => ({
          name: skill.name,
          numId: skill.numId,
          competencies: skill.competencies.map((competency) => ({
            name: competency.name,
            numId: competency.numId
          }))
        }))
      };
    })
  };

  return structuredData;
}

// Helper function to format relative time (e.g., "2 days ago")
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
} 