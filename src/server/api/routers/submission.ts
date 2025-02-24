import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createInput = z.object({
  challengeId: z.string(),
  audioUrl: z.string().optional(),
  screenUrl: z.string().optional(),
  transcript: z.string().optional(),
});

const updateInput = z.object({
  id: z.string(),
  audioUrl: z.string().optional(),
  screenUrl: z.string().optional(),
  transcript: z.string().optional(),
  feedback: z.any().optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "FAILED"]).optional(),
  completedAt: z.date().optional(),
});

const defaultSubmissionSelect = {
  id: true,
  audioUrl: true,
  screenUrl: true,
  transcript: true,
  feedback: true,
  status: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  challenge: {
    select: {
      id: true,
      title: true,
      createdBy: {
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
            challenge: {
              creatorId: ctx.userId,
            },
          },
        ],
      },
      select: defaultSubmissionSelect,
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.submission.findUnique({
        where: { id: input.id },
        select: defaultSubmissionSelect,
      });
    }),

  update: protectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, feedback, ...updateData } = input;
      return ctx.db.submission.update({
        where: { id },
        data: {
          ...updateData,
          ...(feedback && { feedback }),
        },
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