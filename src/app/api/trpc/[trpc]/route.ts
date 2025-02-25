import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env.mjs";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = async (req: NextRequest) => {
  try {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: async () => {
        try {
          return await createTRPCContext({
            headers: req.headers,
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
