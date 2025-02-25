import "server-only";

import { createTRPCReact } from "@trpc/react-query";

import { type AppRouter } from "~/server/api/root";

const api = createTRPCReact<AppRouter>();

/**
 * NOTE: These functions are currently not being used but are kept for future use
 * when we need to make tRPC calls directly from React Server Components.
 * Commenting them out to avoid lint warnings.
 */
/*
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
*/

export { api };
