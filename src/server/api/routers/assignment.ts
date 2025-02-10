import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { PromptStore } from "~/lib/prompts";

// The API key is read from GOOGLE_GENERATIVE_AI_API_KEY environment variable by default
const model = google("gemini-2.0-flash-lite-preview-02-05", {
  safetySettings: [
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ],
});

type QuestionResponse = {
  questions: Array<{
    id: string;
    text: string;
  }>;
};

export const assignmentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        courseId: z.string(),
        content: z.string(),
        questions: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          }),
        ),
        summary: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create the assignment with the summary
      const assignment = await ctx.db.assignment.create({
        data: {
          name: input.name,
          courseId: input.courseId,
          content: input.content,
          summary: input.summary,
          questions: {
            create: input.questions.map((q) => ({
              text: q.text,
            })),
          },
        },
      });

      return assignment;
    }),

  generateQuestions: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        mimeType: z.string(),
        numberOfQuestions: z.number().min(1).default(3),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log("Generating questions for file type:", input.mimeType);
        
        const { text } = await generateText({
          model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: PromptStore.getQuestionGenerationPrompt(input.numberOfQuestions),
                },
                {
                  type: "file",
                  data: Buffer.from(input.content, "base64"),
                  mimeType: input.mimeType,
                },
              ],
            },
          ],
        });

        console.log("Raw model response:", text);

        // Try to extract JSON if there's any surrounding text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No JSON object found in response");
          throw new Error("No JSON found in response");
        }

        let parsedResponse: unknown;
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          throw new Error("Model response was not valid JSON");
        }

        // Type guard function to check if the response has the correct structure
        function isQuestionResponse(value: unknown): value is QuestionResponse {
          return (
            typeof value === "object" &&
            value !== null &&
            "questions" in value &&
            Array.isArray((value as QuestionResponse).questions) &&
            (value as QuestionResponse).questions.every(
              (q): q is { id: string; text: string } =>
                typeof q === "object" &&
                q !== null &&
                "id" in q &&
                "text" in q &&
                typeof q.id === "string" &&
                typeof q.text === "string"
            )
          );
        }

        if (!isQuestionResponse(parsedResponse)) {
          console.error("Invalid response structure:", parsedResponse);
          throw new Error("Response missing questions array or has invalid format");
        }

        const questions = parsedResponse.questions;
        if (questions.length !== input.numberOfQuestions) {
          console.error("Wrong number of questions:", questions.length);
          throw new Error(`Expected ${input.numberOfQuestions} questions but got ${questions.length}`);
        }

        return questions;
      } catch (error) {
        console.error("Error in generateQuestions:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to generate questions: ${error.message}`);
        }
        throw new Error("Failed to generate questions");
      }
    }),

  generateSummary: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        mimeType: z.string(),
        questions: z.array(z.object({
          id: z.string(),
          text: z.string(),
        })),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { text } = await generateText({
          model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: PromptStore.getSummaryGenerationPrompt(input.questions),
                },
                {
                  type: "file",
                  data: Buffer.from(input.content, "base64"),
                  mimeType: input.mimeType,
                },
              ],
            },
          ],
        });

        return { summary: text };
      } catch (error) {
        console.error("Error in generateSummary:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to generate summary: ${error.message}`);
        }
        throw new Error("Failed to generate summary");
      }
    }),

  getWithQuestions: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.assignment.findUnique({
        where: { id: input.id },
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.assignment.findMany({
      include: {
        course: true,
        questions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.assignment.delete({
        where: { id: input.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        courseId: z.string(),
        questions: z.array(
          z.object({
            id: z.string(),
            text: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update the assignment
      const assignment = await ctx.db.assignment.update({
        where: { id: input.id },
        data: {
          name: input.name,
          courseId: input.courseId,
        },
      });

      // Update existing questions and create new ones
      for (const question of input.questions) {
        if (question.id.length > 10) { // Existing question (has a real DB id)
          await ctx.db.question.update({
            where: { id: question.id },
            data: { text: question.text },
          });
        } else { // New question (has a temporary id)
          await ctx.db.question.create({
            data: {
              text: question.text,
              assignmentId: assignment.id,
            },
          });
        }
      }

      return assignment;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const assignment = await ctx.db.assignment.findUnique({
        where: { id: input.id },
        include: {
          course: {
            include: {
              user: {
                select: {
                  name: true,
                }
              }
            }
          },
          questions: true,
        },
      })

      return assignment
    }),
}); 