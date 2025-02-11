import { headers } from "next/headers"
import { type NextApiRequest, type NextApiResponse } from "next"
import { createTRPCContext } from "~/server/api/trpc"
import { appRouter } from "~/server/api/root"

/**
 * This is the server-side caller for tRPC procedures.
 * Use this in Server Components to call tRPC procedures.
 */
export const serverClient = () => {
  const ctx = createTRPCContext({
    req: { headers: Object.fromEntries(headers().entries()) } as NextApiRequest,
    res: {} as NextApiResponse,
    info: {
      type: "query",
      accept: "application/jsonl",
      isBatchCall: false,
      calls: [],
      connectionParams: {},
      signal: new AbortController().signal,
    },
  });
  return appRouter.createCaller(ctx);
} 