import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

export const courseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // First, ensure the user exists in our database
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.auth.userId },
      })

      if (!user) {
        // Create the user if they don't exist
        await ctx.db.user.create({
          data: {
            id: ctx.auth.userId,
            // You can add other fields from Clerk here if needed
            email: ctx.auth.user?.emailAddresses[0]?.emailAddress,
            name: `${ctx.auth.user?.firstName ?? ""} ${ctx.auth.user?.lastName ?? ""}`.trim(),
          },
        })
      }

      // Now create the course
      return ctx.db.course.create({
        data: {
          name: input.name,
          userId: ctx.auth.userId,
        },
      })
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.course.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }),
}) 