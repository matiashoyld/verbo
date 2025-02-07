import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "~/server/api/root";
import { type inferRouterOutputs } from "@trpc/server";

export const api = createTRPCReact<AppRouter>();

export type RouterOutputs = inferRouterOutputs<AppRouter>; 