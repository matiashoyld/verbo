import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Get the authenticated user's role
  getUserRole: protectedProcedure
    .query(async ({ ctx }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    }),
}); 