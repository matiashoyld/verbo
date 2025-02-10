import { headers } from "next/headers"
import { createTRPCContext } from "~/server/api/trpc"
import { appRouter } from "~/server/api/root"

/**
 * This is the server-side caller for tRPC procedures.
 * Use this in Server Components to call tRPC procedures.
 */
export const serverClient = async () => {
  const ctx = await createTRPCContext({
    headers: new Headers(headers()),
  })
  return appRouter.createCaller(ctx)
} 