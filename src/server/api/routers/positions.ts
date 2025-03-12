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
    // Use standard Prisma query instead of raw SQL
    const positions = await ctx.db.commonPosition.findMany({
      orderBy: {
        title: 'asc',
      },
    });
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
              competencies_assessed: z.array(
                z.object({
                  numId: z.number().optional(),         // Competency numId
                  name: z.string(),
                  skillNumId: z.number().nullable().optional(), // Parent skill numId
                })
              ).optional(),
              skills_assessed: z.array(
                z.object({
                  numId: z.number().optional(),         // Competency numId
                  name: z.string(),
                  skillNumId: z.number().nullable().optional(), // Parent skill numId
                })
              ).optional(),
            }).refine(data => 
              // Ensure at least one of the two fields is present
              data.competencies_assessed !== undefined || data.skills_assessed !== undefined,
              {
                message: "Either competencies_assessed or skills_assessed must be provided"
              }
            )
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
        
        // Create the position record using standard Prisma client
        const position = await ctx.db.position.create({
          data: {
            title: input.title,
            jobDescription: input.jobDescription,
            context: input.assessment.context,
            openings: 1,
            creatorId: creatorId,
          },
          select: {
            id: true
          }
        });
        
        const positionId = position.id;
        console.log("Created position:", positionId);
        
        // Create position questions and associate competencies
        for (const question of input.assessment.questions) {
          // Insert the question using standard Prisma client
          const questionRecord = await ctx.db.positionQuestion.create({
            data: {
              position: {
                connect: {
                  id: positionId
                }
              },
              question: question.question,
              context: question.context
            },
            select: {
              id: true
            }
          });
          
          if (questionRecord) {
            const questionId = questionRecord.id;
            
            // Process competencies for the question
            try {
              // Support both old and new field names for backward compatibility
              const competenciesAssessed = question.competencies_assessed || question.skills_assessed || [];
              
              if (competenciesAssessed.length > 0) {
                console.log(`Processing ${competenciesAssessed.length} competencies for question ${questionId}`);
                
                // Statistics tracking
                let directMatches = 0;
                let failed = 0;
                let missingNumIds = 0;
                
                // Process each competency
                for (const competency of competenciesAssessed) {
                  try {
                    let competencyId = null;
                    
                    // Skip negative numIds (these are our fallbacks from the generateFallbackId function)
                    if (competency.numId !== null && competency.numId !== undefined) {
                      if (competency.numId < 0) {
                        console.warn(`Skipping fallback numId ${competency.numId} for "${competency.name}" - this is not a real database ID`);
                        missingNumIds++;
                        continue;
                      }
                      
                      // Extract competency name for better logging
                      const info = extractCompetencyInfo(competency.name);
                      const competencyName = info.competencyName;
                      const skillName = info.skillName;
                      
                      console.log(`Looking up competency "${competencyName}" (numId: ${competency.numId}), parent skill: "${skillName}" (numId: ${competency.skillNumId || 'unknown'})`);
                      
                      // IMPORTANT: Look up the competency by its numId, NOT the skill numId
                      const competencyRecord = await ctx.db.competency.findFirst({
                        where: {
                          numId: competency.numId,
                        },
                        select: {
                          id: true,
                          name: true,
                          skill: {
                            select: {
                              name: true
                            }
                          }
                        }
                      });
                      
                      if (competencyRecord) {
                        competencyId = competencyRecord.id;
                        directMatches++;
                        console.log(`✓ Direct competency match for "${competencyName}" using numId: ${competency.numId} (belongs to skill: ${competencyRecord.skill?.name || 'unknown'})`);
                      } else {
                        console.warn(`✗ No competency found with numId: ${competency.numId} for "${competencyName}"`);
                        
                        // If we have a skill ID, try looking up the competency by name and parent skill ID
                        if (competency.skillNumId) {
                          console.log(`Attempting to find competency "${competencyName}" by name and parent skill numId: ${competency.skillNumId}`);
                          
                          const skillBasedCompetency = await ctx.db.competency.findFirst({
                            where: {
                              name: {
                                equals: competencyName,
                                mode: 'insensitive'
                              },
                              skill: {
                                numId: competency.skillNumId
                              }
                            },
                            select: { 
                              id: true,
                              name: true,
                              skill: {
                                select: {
                                  name: true,
                                  numId: true
                                }
                              }
                            }
                          });
                          
                          if (skillBasedCompetency) {
                            competencyId = skillBasedCompetency.id;
                            console.log(`✓ Found competency "${competencyName}" using parent skill ID lookup (skill: "${skillBasedCompetency.skill?.name}", numId: ${skillBasedCompetency.skill?.numId})`);
                          }
                        }
                        
                        if (!competencyId) {
                          failed++;
                        }
                      }
                    } else {
                      console.warn(`✗ Competency "${competency.name}" has no numId`);
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
                      console.warn(`✗ Failed to find competency for "${competency.name}"`);
                      failed++;
                    }
                  } catch (error) {
                    console.error(`Error processing competency "${competency.name}":`, error);
                    failed++;
                  }
                }
                
                // Log summary statistics for this question
                console.log(`Question competency matching: 
- ${directMatches} direct matches (${Math.round((directMatches)/(competenciesAssessed.length)*100 || 0)}%)
- ${failed} failed matches
- ${missingNumIds} competencies with missing or invalid numIds`);
              }
            } catch (error) {
              console.error(`Error processing competencies for question ${questionId}:`, error);
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
      // Use standard Prisma query with include for relationships
      const positions = await ctx.db.position.findMany({
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform the results to match the expected interface
      return positions.map(position => ({
        id: position.id,
        title: position.title,
        created: formatRelativeTime(position.createdAt),
        createdAt: position.createdAt.toISOString(),
        questionCount: position._count.questions,
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
        // Fetch the position using standard Prisma
        const positionData = await ctx.db.position.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            title: true,
            jobDescription: true,
            context: true,
            createdAt: true,
            questions: {
              select: {
                id: true,
                question: true,
                context: true,
                competencies: {
                  select: {
                    competencyId: true,
                    competency: {
                      select: {
                        id: true,
                        name: true,
                        skill: {
                          select: {
                            id: true,
                            name: true,
                            category: {
                              select: {
                                id: true,
                                name: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!positionData) {
          throw new Error("Position not found");
        }

        // Transform the data to match what the frontend expects
        return {
          id: positionData.id,
          title: positionData.title,
          jobDescription: positionData.jobDescription,
          context: positionData.context,
          createdAt: positionData.createdAt.toISOString(),
          questions: positionData.questions.map(q => ({
            id: q.id,
            question: q.question,
            context: q.context,
            // Map competencies with their skills
            competencies: q.competencies.map(c => ({
              id: c.competency.id,
              name: c.competency.name,
              skillId: c.competency.skill.id,
              skillName: c.competency.skill.name,
              categoryId: c.competency.skill.category.id,
              categoryName: c.competency.skill.category.name,
            })),
          })),
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
          numId: z.number().nullable(), // This should be competency numId
          skillNumId: z.number().nullable().optional(), // Add parent skill numId
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
              for (const item of q.skills) {
                // Important: item.numId should be a competency numId, not a skill numId
                // Extract competency name (possibly with skill name in parentheses)
                const competencyInfo = extractCompetencyInfo(item.name);
                const competencyName = competencyInfo.competencyName;
                const skillName = competencyInfo.skillName;
                
                console.log(`Looking up competency "${competencyName}" with numId: ${item.numId}, skill: "${skillName}" (numId: ${item.skillNumId || 'unknown'})`);
                
                if (item.numId !== null) {
                  // Find the competency ID from numId if available - use competency numId, not skill numId
                  const competencyRecord = await tx.$queryRaw<[{ id: string }]>`
                    SELECT id FROM "Competency" WHERE num_id = ${item.numId}
                  `;
                  
                  if (competencyRecord && competencyRecord[0]) {
                    await tx.$executeRaw`
                      INSERT INTO "QuestionCompetency" (
                        question_id, competency_id
                      ) VALUES (
                        ${q.id}::uuid, ${competencyRecord[0].id}::uuid
                      )
                    `;
                    console.log(`✓ Successfully linked competency "${competencyName}" to question`);
                  } else {
                    console.warn(`✗ No competency found with numId: ${item.numId}`);
                    
                    // Try fallback lookup by name and skill ID if numId lookup failed
                    if (item.skillNumId) {
                      console.log(`Attempting fallback lookup by name: "${competencyName}" and parent skill numId: ${item.skillNumId}`);
                      
                      // Look up by competency name and skill ID
                      const skillBasedCompetency = await tx.$queryRaw<[{ id: string }]>`
                        SELECT c.id
                        FROM "Competency" c
                        JOIN "Skill" s ON c.skill_id = s.id
                        WHERE LOWER(c.name) = LOWER(${competencyName})
                        AND s.num_id = ${item.skillNumId}
                        LIMIT 1
                      `;
                      
                      if (skillBasedCompetency && skillBasedCompetency[0]) {
                        await tx.$executeRaw`
                          INSERT INTO "QuestionCompetency" (
                            question_id, competency_id
                          ) VALUES (
                            ${q.id}::uuid, ${skillBasedCompetency[0].id}::uuid
                          )
                        `;
                        console.log(`✓ Successfully linked competency by skill numId lookup`);
                      } else {
                        console.warn(`✗ Fallback lookup also failed for "${competencyName}" with parent skill numId: ${item.skillNumId}`);
                      }
                    } else if (competencyName && skillName) {
                      // Fall back to name-based lookup
                      console.log(`Attempting fallback lookup by name: "${competencyName}" in skill: "${skillName}"`);
                      
                      // Look up by competency name and skill name
                      const fallbackCompetency = await tx.$queryRaw<[{ id: string }]>`
                        SELECT c.id
                        FROM "Competency" c
                        JOIN "Skill" s ON c.skill_id = s.id
                        WHERE LOWER(c.name) = LOWER(${competencyName})
                        AND LOWER(s.name) = LOWER(${skillName})
                        LIMIT 1
                      `;
                      
                      if (fallbackCompetency && fallbackCompetency[0]) {
                        await tx.$executeRaw`
                          INSERT INTO "QuestionCompetency" (
                            question_id, competency_id
                          ) VALUES (
                            ${q.id}::uuid, ${fallbackCompetency[0].id}::uuid
                          )
                        `;
                        console.log(`✓ Successfully linked competency by name lookup`);
                      } else {
                        console.warn(`✗ Fallback lookup also failed for "${competencyName}" in "${skillName}"`);
                      }
                    }
                  }
                } else {
                  console.warn(`✗ Cannot link competency "${competencyName}" - missing numId`);
                  
                  // If we have a skill name, try to look up by name as a last resort
                  if (competencyName && skillName) {
                    console.log(`Attempting to find by name only: "${competencyName}" in "${skillName}"`);
                    
                    const namedCompetency = await tx.$queryRaw<[{ id: string }]>`
                      SELECT c.id
                      FROM "Competency" c
                      JOIN "Skill" s ON c.skill_id = s.id
                      WHERE LOWER(c.name) = LOWER(${competencyName})
                      AND LOWER(s.name) = LOWER(${skillName})
                      LIMIT 1
                    `;
                    
                    if (namedCompetency && namedCompetency[0]) {
                      await tx.$executeRaw`
                        INSERT INTO "QuestionCompetency" (
                          question_id, competency_id
                        ) VALUES (
                          ${q.id}::uuid, ${namedCompetency[0].id}::uuid
                        )
                      `;
                      console.log(`✓ Successfully linked competency using name-only lookup`);
                    } else {
                      console.warn(`✗ Name-only lookup failed for "${competencyName}" in "${skillName}"`);
                    }
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
        // Instead of using $queryRaw, use standard Prisma queries which handle connection pooling better
        const position = await ctx.db.position.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            title: true,
            jobDescription: true,
            context: true,
            createdAt: true,
            creatorId: true,
            creator: {
              select: {
                name: true,
              },
            },
            questions: {
              select: {
                id: true,
                question: true,
                context: true,
                competencies: {
                  select: {
                    competency: {
                      select: {
                        id: true,
                        name: true,
                        skill: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!position) {
          console.error(`Position not found: ${input.id}`);
          return null;
        }

        // Transform the data to match the expected format
        return {
          id: position.id,
          title: position.title,
          job_description: position.jobDescription,
          context: position.context,
          created_at: position.createdAt,
          creator_id: position.creatorId,
          creator_name: position.creator?.name || null,
          questions: position.questions,
        };
      } catch (error) {
        console.error(`Error fetching position by ID (public):`, error);
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

// Helper function to extract competency info
function extractCompetencyInfo(formattedName: string): { competencyName: string; skillName: string | null } {
  const match = formattedName.match(/^(.+?) \((.+?)\)$/);
  if (match && match.length >= 3) {
    return {
      competencyName: match[1]!,
      skillName: match[2] || null,
    };
  }
  return {
    competencyName: formattedName,
    skillName: null,
  };
} 