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
            // Get the associated subSkills (competencies)
            subSkills: {
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
          competencies: skill.subSkills.map((subSkill) => ({
            name: subSkill.name,
            numId: subSkill.numId,
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
                      
                      // Look up the competency by its numId (which should match the SubSkill.num_id column)
                      const result = await ctx.db.$queryRaw<Array<{ id: string }>>`
                        SELECT id FROM "SubSkill" WHERE "num_id" = ${skill.numId}::int LIMIT 1
                      `;
                      
                      if (result && result.length > 0 && result[0]) {
                        competencyId = result[0].id;
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

  // Get all skills with their categories and subskills
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
      subSkills: {
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
          competencies: skill.subSkills.map((subSkill) => ({
            name: subSkill.name,
            numId: subSkill.numId
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