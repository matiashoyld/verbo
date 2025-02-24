import { TRPCError } from "@trpc/server";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const skillsRouter = createTRPCRouter({
  importFromCsv: protectedProcedure
    .input(z.object({ csvContent: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has RECRUITER role
      const { userId } = ctx;
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== "RECRUITER") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only recruiters can import skills",
        });
      }

      const records = parse(input.csvContent, {
        columns: true,
        skip_empty_lines: true,
      });

      // Validate CSV structure
      const requiredColumns = ["category", "skill", "competency", "criteria"];
      const firstRecord = records[0];
      if (!firstRecord || !requiredColumns.every((col) => col in firstRecord)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid CSV format. Required columns: category, skill, competency, criteria",
        });
      }

      try {
        // Process records and save to database
        for (const record of records) {
          // Find or create category
          const category = await ctx.db.category.upsert({
            where: { name: record.category },
            create: { name: record.category },
            update: {},
          });

          // Find or create skill
          const skill = await ctx.db.skill.upsert({
            where: {
              categoryId_name: {
                categoryId: category.id,
                name: record.skill,
              },
            },
            create: {
              name: record.skill,
              categoryId: category.id,
            },
            update: {},
          });

          // Find or create subskill (competency)
          const subSkill = await ctx.db.subSkill.upsert({
            where: {
              skillId_name: {
                skillId: skill.id,
                name: record.competency,
              },
            },
            create: {
              name: record.competency,
              skillId: skill.id,
            },
            update: {},
          });

          // Create criterion
          await ctx.db.criterion.create({
            data: {
              description: record.criteria,
              subSkillId: subSkill.id,
            },
          });
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to import skills",
          cause: error,
        });
      }
    }),

  // Add a query to fetch all categories with their skills
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      include: {
        skills: {
          include: {
            subSkills: {
              include: {
                criteria: true,
              },
            },
          },
        },
      },
    });
  }),

  importSkills: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ ctx, input }) => {
      // The protectedProcedure middleware already ensures the user is authenticated
      // and ctx.userId is available
      try {
        // Get the user to check their role
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.userId },
          select: { role: true },
        });

        if (!user || user.role !== "RECRUITER") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only recruiters can import skills",
          });
        }

        // Create a default category for imported skills
        const defaultCategory = await ctx.db.category.upsert({
          where: { name: "General" },
          create: { name: "General" },
          update: {},
        });

        // Create skills with the default category
        const skills = await ctx.db.skill.createMany({
          data: input.map((name) => ({
            name,
            categoryId: defaultCategory.id,
          })),
          skipDuplicates: true,
        });
        return skills;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to import skills",
          cause: error,
        });
      }
    }),
}); 