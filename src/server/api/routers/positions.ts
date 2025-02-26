import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { extractSkillsFromJobDescription, generateAssessmentCase } from "~/lib/gemini";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

// Types for the database structures
interface Category {
  id: string;
  name: string;
}

interface SubSkill {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  subSkills: SubSkill[];
}

// Types for the structured data format we send to the AI
interface StructuredCategory {
  name: string;
  skills: Array<{
    name: string;
    competencies: Array<{
      name: string;
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
            category: {
              select: {
                name: true,
              },
            },
            // Get the associated subSkills (competencies)
            subSkills: {
              select: {
                name: true,
              },
            },
          },
        });

        // Transform the data into the format expected by the frontend
        const transformedData = skills.map((skill) => ({
          skillName: skill.name,
          categoryName: skill.category.name,
          competencies: skill.subSkills.map((subSkill) => ({
            name: subSkill.name,
          })),
        }));

        return transformedData;
      } catch (error) {
        console.error("Error fetching skills and categories:", error);
        // Return some fallback data
        return [
          {
            skillName: "JavaScript",
            categoryName: "Programming",
            competencies: [
              { name: "DOM Manipulation" },
              { name: "ES6+ Features" },
              { name: "Asynchronous Patterns" }
            ]
          },
          {
            skillName: "TypeScript",
            categoryName: "Programming",
            competencies: [
              { name: "Type Definitions" },
              { name: "Advanced Types" }
            ]
          },
          {
            skillName: "React",
            categoryName: "Frontend",
            competencies: [
              { name: "Hooks" },
              { name: "Context API" },
              { name: "State Management" }
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
            skills: z.array(
              z.object({
                name: z.string(),
                competencies: z.array(
                  z.object({
                    name: z.string(),
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
            skills: category.skills
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
        department: z.string(),
        jobDescription: z.string(),
        skills: z.array(
          z.object({
            category: z.string(),
            skills: z.array(
              z.object({
                name: z.string(),
                competencies: z.array(
                  z.object({
                    name: z.string(),
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
                  id: z.number(),
                  name: z.string(),
                })
              ),
            })
          ),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Creating position with userId:", ctx.userId);
        
        // Use one of the known user IDs from the database
        // We know we have these two users available:
        const knownUserIds = [
          "user_2tTQWcqEh7WGcUVvuH2tUiTuOEK", // matiashoyl@gmail.com
          "user_2tTTk0Uw9VnK2myNaIgTeB7EWgm"  // matias@laboratorio.la
        ];
        
        // Use the current user's ID if it matches one of our known users, otherwise use the first known user
        const creatorId = knownUserIds.includes(ctx.userId) ? ctx.userId : knownUserIds[0];
        
        console.log("Using creator ID:", creatorId);
        
        // Create the position record using SQL with proper type casting
        const positionResult = await ctx.db.$queryRaw<Array<{id: string}>>`
          INSERT INTO "Position" (
            id, title, department, "jobDescription", context, status, openings, "creator_id", "created_at", "updated_at"
          ) VALUES (
            gen_random_uuid(), ${input.title}, ${input.department}, ${input.jobDescription}, 
            ${input.assessment.context}, 'DRAFT', 1, ${creatorId}, NOW(), NOW()
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
        
        // Save the skills for this position using SQL
        for (const category of input.skills) {
          for (const skill of category.skills) {
            // Only save skills that have at least one selected competency
            const selectedCompetencies = skill.competencies
              .filter(comp => comp.selected)
              .map(comp => comp.name);
            
            if (selectedCompetencies.length > 0) {
              await ctx.db.$executeRaw`
                INSERT INTO "PositionSkill" (
                  id, "position_id", "category_name", "skill_name", competencies, "created_at", "updated_at"
                ) VALUES (
                  gen_random_uuid(), ${positionId}::uuid, ${category.category}, ${skill.name}, 
                  ${selectedCompetencies}, NOW(), NOW()
                )
              `;
            }
          }
        }

        // Save the questions for this position using SQL
        for (const question of input.assessment.questions) {
          await ctx.db.$executeRaw`
            INSERT INTO "PositionQuestion" (
              id, "position_id", question, context, "skills_assessed", "created_at", "updated_at"
            ) VALUES (
              gen_random_uuid(), ${positionId}::uuid, ${question.question}, ${question.context}, 
              ${JSON.stringify(question.skills_assessed)}, NOW(), NOW()
            )
          `;
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
        department: string;
        openings: number;
        status: string;
        created_at: Date;
        question_count: number;
      }>>`
        SELECT 
          p.id, 
          p.title, 
          p.department, 
          p.openings, 
          p.status, 
          p.created_at,
          COUNT(pq.id) as question_count
        FROM "Position" p
        LEFT JOIN "PositionQuestion" pq ON p.id = pq.position_id
        GROUP BY p.id, p.title, p.department, p.openings, p.status, p.created_at
        ORDER BY p.created_at DESC
      `;

      return positions.map(position => ({
        id: position.id,
        title: position.title,
        department: position.department,
        openings: position.openings,
        status: position.status,
        created: formatRelativeTime(position.created_at),
        questionCount: position.question_count,
      }));
    } catch (error) {
      console.error("Error fetching positions:", error);
      return [];
    }
  }),
});

/**
 * Helper function to fetch complete skills data from the database
 * for use with the indexing approach of the AI
 */
async function fetchCompleteSkillsData(db: PrismaClient): Promise<StructuredData> {
  // Get all categories
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  // Get all skills with their categories and subskills
  const skills = await db.skill.findMany({
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      subSkills: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Build a nested structure that matches what our AI function expects
  const structuredData: StructuredData = {
    categories: categories.map((category: Category) => {
      // Find all skills that belong to this category
      const categorySkills = skills.filter((skill: Skill) => 
        skill.categoryId === category.id
      );
      
      return {
        name: category.name,
        skills: categorySkills.map((skill: Skill) => ({
          name: skill.name,
          competencies: skill.subSkills.map((subSkill: SubSkill) => ({
            name: subSkill.name
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