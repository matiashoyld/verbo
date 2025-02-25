import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const positionsRouter = createTRPCRouter({
  getCommonPositions: publicProcedure.query(async ({ ctx }) => {
    const positions = await ctx.db.commonPosition.findMany({
      orderBy: { title: "asc" },
    });
    return positions;
  }),
}); 