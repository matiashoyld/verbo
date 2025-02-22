import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const createInput = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  instructions: z.string().min(1),
  timeLimit: z.number().optional(),
  skillIds: z.array(z.string()).optional(),
});

const updateInput = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  instructions: z.string().min(1).optional(),
  timeLimit: z.number().optional(),
  skillIds: z.array(z.string()).optional(),
});

const defaultChallengeSelect = {
  id: true,
  title: true,
  description: true,
  instructions: true,
  timeLimit: true,
  createdAt: true,
  updatedAt: true,
  skills: true,
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export const challengeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      const { skillIds, ...data } = input;
      return ctx.db.challenge.create({
        data: {
          ...data,
          creatorId: ctx.session.user.id,
          ...(skillIds && {
            skills: {
              connect: skillIds.map((id) => ({ id })),
            },
          }),
        },
        select: defaultChallengeSelect,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.challenge.findMany({
      select: defaultChallengeSelect,
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.challenge.findUnique({
        where: { id: input.id },
        select: defaultChallengeSelect,
      });
    }),

  update: protectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      const { id, skillIds, ...updateData } = input;
      return ctx.db.challenge.update({
        where: { id },
        data: {
          ...updateData,
          ...(skillIds && {
            skills: {
              set: skillIds.map((skillId) => ({ id: skillId })),
            },
          }),
        },
        select: defaultChallengeSelect,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.challenge.delete({
        where: { id: input.id },
        select: defaultChallengeSelect,
      });
    }),
});

export type ChallengeRouter = typeof challengeRouter;
export type ChallengeRouterInput = inferRouterInputs<ChallengeRouter>;
export type ChallengeRouterOutput = inferRouterOutputs<ChallengeRouter>; 