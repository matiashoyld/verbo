import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// The API key is read from GOOGLE_GENERATIVE_AI_API_KEY environment variable by default
const model = google("gemini-2.0-flash-lite-preview-02-05", {
  safetySettings: [
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ],
});

export const assignmentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        courseId: z.string(),
        content: z.string(),
        questions: z.array(z.object({
          id: z.string(),
          text: z.string(),
        })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create the assignment and its questions in a transaction
      return ctx.db.$transaction(async (tx) => {
        // First create the assignment
        const assignment = await tx.assignment.create({
          data: {
            name: input.name,
            courseId: input.courseId,
            content: input.content,
            questions: {
              create: input.questions.map(q => ({
                text: q.text,
              })),
            },
          },
          include: {
            questions: true,
          },
        });

        return assignment;
      });
    }),

  generateQuestions: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        mimeType: z.string(),
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
                  text: `You are a teaching assistant creating questions based on a document. Create exactly 3 thought-provoking questions that test understanding of key concepts.

IMPORTANT: Your response must be ONLY a JSON object in this exact format, with no additional text or explanation:

{
  "questions": [
    {
      "id": "1",
      "text": "First question here?"
    },
    {
      "id": "2",
      "text": "Second question here?"
    }
  ]
}

Requirements:
1. Response must be valid JSON
2. Must have exactly 3 questions
3. Each question must have "id" (string) and "text" (string)
4. No additional text or explanation outside the JSON
5. Questions should be thought-provoking and test understanding
6. Focus on key concepts from the document`,
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

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          throw new Error("Model response was not valid JSON");
        }

        if (!parsedResponse?.questions || !Array.isArray(parsedResponse.questions)) {
          console.error("Invalid response structure:", parsedResponse);
          throw new Error("Response missing questions array");
        }

        const questions = parsedResponse.questions;
        if (questions.length !== 3) {
          console.error("Wrong number of questions:", questions.length);
          throw new Error("Expected 3 questions but got " + questions.length);
        }

        const validQuestions = questions.every((q: unknown) => 
          typeof q === "object" && q !== null && 
          typeof (q as { id: unknown }).id === "string" && 
          typeof (q as { text: unknown }).text === "string"
        );

        if (!validQuestions) {
          console.error("Invalid question format:", questions);
          throw new Error("Questions have invalid format");
        }

        return questions as Array<{ id: string; text: string }>;
      } catch (error) {
        console.error("Error in generateQuestions:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to generate questions: ${error.message}`);
        }
        throw new Error("Failed to generate questions");
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
}); 