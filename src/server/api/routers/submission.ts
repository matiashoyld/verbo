import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createInput = z.object({
  positionId: z.string(),
});

const updateInput = z.object({
  id: z.string(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "FAILED"]).optional(),
  completedAt: z.date().optional(),
});

const defaultSubmissionSelect = {
  id: true,
  status: true,
  startedAt: true,
  completedAt: true,
  created_at: true,
  updated_at: true,
  position: {
    select: {
      id: true,
      title: true,
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  candidate: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

// Enhanced selection with questions and competency assessments
const detailedSubmissionSelect = {
  ...defaultSubmissionSelect,
  position: {
    select: {
      id: true,
      title: true,
      questions: {
        select: {
          id: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  questions: {
    select: {
      id: true,
      overall_assessment: true,
      createdAt: true,
      updatedAt: true,
      skills_demonstrated: true,
      strengths: true,
      areas_of_improvement: true,
      positionQuestion: {
        select: {
          id: true,
          question: true,
          context: true,
        },
      },
      competencyAssessments: {
        select: {
          id: true,
          level: true,
          rationale: true,
          questionCompetency: {
            select: {
              id: true,
              competency: {
                select: {
                  id: true,
                  name: true,
                  skillId: true,
                  skill: {
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
      recordingMetadata: {
        select: {
          id: true,
          filePath: true,
          fileSize: true,
          durationSeconds: true,
          processed: true,
        },
      },
    },
  },
} as const;

export const submissionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.submission.create({
        data: {
          ...input,
          candidateId: ctx.userId,
          status: "IN_PROGRESS",
        },
        select: defaultSubmissionSelect,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.submission.findMany({
      where: {
        OR: [
          { candidateId: ctx.userId },
          {
            position: {
              creatorId: ctx.userId,
            },
          },
        ],
      },
      select: defaultSubmissionSelect,
    });
  }),

  // New procedure to get all submissions for a recruiter 
  getAllForRecruiter: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.submission.findMany({
      where: {
        position: {
          creatorId: ctx.userId,
        },
      },
      select: detailedSubmissionSelect,
      orderBy: {
        startedAt: 'desc',
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.submission.findUnique({
        where: { id: input.id },
        select: detailedSubmissionSelect,
      });
    }),

  update: protectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.submission.update({
        where: { id },
        data: updateData,
        select: defaultSubmissionSelect,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.submission.delete({
        where: { id: input.id },
        select: defaultSubmissionSelect,
      });
    }),
});

export type SubmissionRouter = typeof submissionRouter;
export type SubmissionRouterInput = inferRouterInputs<SubmissionRouter>;
export type SubmissionRouterOutput = inferRouterOutputs<SubmissionRouter>; 