import "server-only";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This creates a tRPC caller that can be used to make tRPC calls from the server
 */
export const createCaller = () => {
  const heads = new Headers(headers());
  const authObject = auth();

  return appRouter.createCaller(
    createTRPCContext({
      headers: heads,
      auth: authObject,
    }),
  );
};

export const appRouterCaller = createCaller();
