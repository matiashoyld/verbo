import "server-only";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This creates a tRPC caller that can be used to make tRPC calls from the server
 */
export const createCaller = () => {
  const heads = new Headers(headers());

  return appRouter.createCaller(
    createTRPCContext({
      req: { headers: Object.fromEntries(heads.entries()) } as NextApiRequest,
      res: {} as NextApiResponse,
      info: {
        type: "query",
        accept: "application/jsonl",
        isBatchCall: false,
        calls: [],
        connectionParams: {},
        signal: new AbortController().signal,
      },
    }),
  );
};

export const appRouterCaller = createCaller();
