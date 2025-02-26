import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env.mjs";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This is the main handler for the tRPC API route
 */
const handler = async (req: NextRequest) => {
  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => {
        try {
          // Get headers as an object to avoid iteration issues
          const headersObject = Object.fromEntries(req.headers);
          
          return await createTRPCContext({
            headers: new Headers(headersObject),
          });
        } catch (ctxError) {
          console.error("Error creating TRPC context:", ctxError);
          throw ctxError;
        }
      },
      onError:
        env.NODE_ENV === "development"
          ? ({ path, error }) => {
              console.error(
                `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
              );
            }
          : undefined,
    });

    return response;
  } catch (error) {
    console.error("Error in TRPC handler:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export { handler as GET, handler as POST };
