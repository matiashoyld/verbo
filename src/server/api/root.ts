import { challengeRouter } from "~/server/api/routers/challenge";
import { positionsRouter } from "~/server/api/routers/positions";
import { submissionRouter } from "~/server/api/routers/submission";
import { createTRPCRouter } from "~/server/api/trpc";
import { skillsRouter } from "./routers/skills";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  challenge: challengeRouter,
  submission: submissionRouter,
  skills: skillsRouter,
  positions: positionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
