import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { extractSkillsFromJobDescription } from "~/lib/gemini";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
        // Get all categories
        const categories = await ctx.db.category.findMany({
          select: {
            id: true,
            name: true,
          },
        });

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