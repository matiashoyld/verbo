import { expect, describe, it, beforeEach, vi } from "vitest"
import { type inferProcedureInput } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { type AppRouter } from "~/server/api/root"
import type { Course, PrismaClient } from "@prisma/client"
import { mockDeep, type DeepMockProxy } from "vitest-mock-extended"
import { z } from "zod"
import type { JwtPayload } from "@clerk/types"
import type { SignedInAuthObject } from "@clerk/nextjs/server"
import { createTRPCContext } from "../../trpc"
import { appRouter } from "../../root"

// Mock environment variables
vi.mock("~/env.js", () => ({
  env: {
    DATABASE_URL: "test_database_url",
    NODE_ENV: "test",
    CLERK_SECRET_KEY: "test_clerk_secret",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "test_clerk_publishable",
  },
}))

// Create a test router with just the course procedures
const createTestRouter = (db: PrismaClient) => {
  const router = createTRPCRouter({
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        // First, ensure the user exists in our database
        const user = await db.user.findUnique({
          where: { id: ctx.auth.userId },
        })

        if (!user) {
          // Create the user if they don't exist
          await db.user.create({
            data: {
              id: ctx.auth.userId,
              email: ctx.auth.user?.emailAddresses[0]?.emailAddress,
              name: `${ctx.auth.user?.firstName ?? ""} ${ctx.auth.user?.lastName ?? ""}`.trim(),
            },
          })
        }

        // Now create the course
        return db.course.create({
          data: {
            name: input.name,
            userId: ctx.auth.userId,
          },
        })
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      return db.course.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }),
  })

  return router
}

// Type-safe mock data
const mockCourse: Course = {
  id: "1",
  name: "Test Course",
  userId: "user1",
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock Prisma client with proper types
const mockPrisma = {
  course: {
    findMany: vi.fn().mockResolvedValue([mockCourse]),
    create: vi.fn().mockResolvedValue(mockCourse),
    delete: vi.fn().mockResolvedValue(mockCourse),
  },
} as unknown as PrismaClient

// Mock auth object with proper types
const mockAuth = {
  userId: "user1",
} as SignedInAuthObject

describe("course router", () => {
  let db: DeepMockProxy<PrismaClient>
  const userId = "test-user-id"
  const userEmail = "test@example.com"
  const userName = "Test User"

  beforeEach(() => {
    db = mockDeep<PrismaClient>()
    vi.clearAllMocks()
  })

  const createCaller = () => {
    const router = createTestRouter(db)
    const now = Date.now()
    return router.createCaller({
      headers: new Headers(),
      auth: {
        userId,
        user: {
          id: userId,
          emailAddresses: [{
            id: "email-1",
            emailAddress: userEmail,
            verification: null,
            linkedTo: [],
          }],
          firstName: "Test",
          lastName: "User",
        } as any,
        sessionClaims: {
          __raw: "test-raw",
          azp: "test-azp",
          exp: 1234567890,
          iat: 1234567890,
          iss: "https://clerk.com",
          nbf: 1234567890,
          sid: "test-sid",
          sub: userId,
        } satisfies JwtPayload,
        sessionId: "test-session",
        getToken: async () => "test-token",
        orgId: undefined,
        orgRole: undefined,
        orgSlug: undefined,
        actor: undefined,
        orgPermissions: [],
        has: () => false,
        debug: () => ({ userId, sessionId: "test-session" }),
        organization: undefined,
        session: {
          id: "test-session",
          status: "active",
          lastActiveAt: now,
          expireAt: now + 3600000, // 1 hour from now
          abandonAt: now + 7200000, // 2 hours from now
          clientId: "test-client",
          userId,
          createdAt: now,
          updatedAt: now,
        },
      } as SignedInAuthObject,
      db,
    })
  }

  describe("create", () => {
    it("creates a course and creates user if not exists", async () => {
      const caller = createCaller()

      // Mock user not existing
      db.user.findUnique.mockResolvedValueOnce(null)
      
      // Mock user creation
      db.user.create.mockResolvedValueOnce({
        id: userId,
        email: userEmail,
        name: userName,
        emailVerified: null,
        image: null,
        role: "professor",
      })

      // Mock course creation
      db.course.create.mockResolvedValueOnce({
        id: "course-1",
        name: "Test Course",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
      })

      type Input = inferProcedureInput<AppRouter["course"]["create"]>
      const input: Input = {
        name: "Test Course",
      }

      const result = await caller.create(input)

      expect(result).toMatchObject({
        name: "Test Course",
        userId,
      })

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          id: userId,
          email: userEmail,
          name: expect.any(String),
        },
      })

      expect(db.course.create).toHaveBeenCalledWith({
        data: {
          name: "Test Course",
          userId,
        },
      })
    })
  })

  describe("getAll", () => {
    it("returns all courses for the user", async () => {
      const caller = createCaller()

      const mockCourses = [
        {
          id: "course-1",
          name: "Course 1",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId,
        },
        {
          id: "course-2",
          name: "Course 2",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId,
        },
      ]

      db.course.findMany.mockResolvedValueOnce(mockCourses)

      const result = await caller.getAll()

      expect(result).toHaveLength(2)
      expect(result).toEqual(mockCourses)
      expect(db.course.findMany).toHaveBeenCalledWith({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    })
  })
}) 
