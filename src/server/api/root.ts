import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { courseRouter } from "~/server/api/routers/course";
import { assignmentRouter } from "~/server/api/routers/assignment";
import { studentAssignmentRouter } from "~/server/api/routers/student-assignment";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => {
    return { status: "ok" };
  }),
  course: courseRouter,
  assignment: assignmentRouter,
  studentAssignment: studentAssignmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 */
export const createCaller = createCallerFactory(appRouter);
