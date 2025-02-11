import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { Prisma } from "@prisma/client"

export const studentAssignmentRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        studentName: z.string(),
        studentEmail: z.string().email(),
        assignmentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify that the assignment exists
      const assignment = await ctx.db.assignment.findUnique({
        where: { id: input.assignmentId },
        include: { questions: true },
      })

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        })
      }

      try {
        // Try to create a new student assignment
        const studentAssignment = await ctx.db.studentAssignment.create({
          data: {
            studentName: input.studentName,
            studentEmail: input.studentEmail,
            assignmentId: input.assignmentId,
          },
          include: {
            assignment: {
              include: {
                questions: true,
              },
            },
          },
        })

        return studentAssignment
      } catch (error) {
        // If there's a unique constraint violation, it means the student has already started this assignment
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          // Fetch and return the existing assignment instead
          return ctx.db.studentAssignment.findUnique({
            where: {
              studentEmail_assignmentId: {
                studentEmail: input.studentEmail,
                assignmentId: input.assignmentId,
              },
            },
            include: {
              assignment: {
                include: {
                  questions: true,
                },
              },
            },
          })
        }
        
        // For any other error, throw it
        throw error
      }
    }),

  getByEmailAndAssignment: publicProcedure
    .input(
      z.object({
        studentEmail: z.string().email(),
        assignmentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.studentAssignment.findUnique({
        where: {
          studentEmail_assignmentId: {
            studentEmail: input.studentEmail,
            assignmentId: input.assignmentId,
          },
        },
        include: {
          assignment: {
            include: {
              questions: true,
            },
          },
          responses: true,
        },
      })
    }),
}) 