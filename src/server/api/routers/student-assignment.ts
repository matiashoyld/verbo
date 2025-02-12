import { google } from "@ai-sdk/google";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { generateText } from "ai";
import fs from "fs";
import OpenAI from "openai";
import os from "os";
import path from "path";
import { z } from "zod";
import { env } from "~/env";
import { PromptStore } from "~/lib/prompts";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Initialize Gemini model
const model = google("gemini-2.0-flash-lite-preview-02-05", {
  safetySettings: [
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
  ],
});

// Helper function to convert base64 to a buffer and determine file extension
function processAudioData(base64String: string): {
  buffer: Buffer;
  extension: string;
} {
  console.log("Processing audio data format:", base64String.substring(0, 100));

  // Extract MIME type and base64 data
  const matches = base64String.match(/^data:(audio\/[^;]+);base64,(.+)$/);
  if (!matches?.length || !matches[1] || !matches[2]) {
    console.error(
      "Invalid audio data format. Expected format: data:audio/[type];base64,[data]",
    );
    console.error("Received format:", base64String.substring(0, 100));
    throw new Error("Invalid audio data format");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Map MIME types to file extensions
  const mimeToExtension: Record<string, string> = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
  };

  const extension = mimeToExtension[mimeType] ?? "webm";
  console.log("Using extension:", extension, "for MIME type:", mimeType);

  return {
    buffer: Buffer.from(base64Data, "base64"),
    extension,
  };
}

// Helper function to transcribe audio using OpenAI Whisper
// async function transcribeAudio(audioUrl: string): Promise<string> {
//   try {
//     // Fetch the audio file
//     const response = await fetch(audioUrl)
//     const audioBlob = await response.blob()

//     // Convert blob to file
//     const audioFile = new File([audioBlob], "audio.webm", { type: "audio/webm" })

//     // Create a FormData instance
//     const formData = new FormData()
//     formData.append("file", audioFile)
//     formData.append("model", "whisper-1")

//     // Make request to OpenAI API
//     const transcription = await openai.audio.transcriptions.create({
//       file: audioFile,
//       model: "whisper-1",
//     })

//     return transcription.text
//   } catch (error) {
//     console.error("Error transcribing audio:", error)
//     throw new TRPCError({
//       code: "INTERNAL_SERVER_ERROR",
//       message: "Failed to transcribe audio",
//     })
//   }
// }

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
      });

      if (!assignment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Assignment not found",
        });
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
        });

        return studentAssignment;
      } catch (error) {
        // If there's a unique constraint violation, it means the student has already started this assignment
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
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
          });
        }

        // For any other error, throw it
        throw error;
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
      });
    }),

  createResponse: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
        studentAssignmentId: z.string(),
        audioData: z.string(), // Base64 encoded audio data
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let tempFilePath: string | undefined;

      try {
        // Process audio data
        const { buffer, extension } = processAudioData(input.audioData);
        tempFilePath = path.join(
          os.tmpdir(),
          `${Date.now()}-audio.${extension}`,
        );

        // Write the buffer to a temporary file
        fs.writeFileSync(tempFilePath, buffer);

        // Create a file object that OpenAI can handle
        const file = fs.createReadStream(tempFilePath);

        // Transcribe with OpenAI
        const transcription = await openai.audio.transcriptions.create({
          file,
          model: "whisper-1",
          response_format: "text",
          language: "en", // Specify language to improve accuracy
        });

        // Create response with transcription
        const response = await ctx.db.studentResponse.create({
          data: {
            questionId: input.questionId,
            studentAssignmentId: input.studentAssignmentId,
            transcription: transcription,
          },
        });

        return response;
      } catch (error) {
        console.error("Error processing audio:", error);
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to process audio response: ${error.message}`,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process audio response",
          });
        }
      } finally {
        // Clean up: delete the temporary file if it exists
        try {
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (error) {
          console.error("Error cleaning up temporary file:", error);
        }
      }
    }),

  analyzeResponse: publicProcedure
    .input(
      z.object({
        responseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch the response with its question and assignment
      const response = await ctx.db.studentResponse.findUnique({
        where: { id: input.responseId },
        include: {
          question: {
            include: {
              assignment: true,
            },
          },
        },
      });

      if (!response) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Response not found",
        });
      }

      if (!response.transcription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Response has no transcription",
        });
      }

      try {
        // Generate analysis using Gemini
        const { text } = await generateText({
          model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: PromptStore.getResponseAnalysisPrompt(
                    response.question.text,
                    response.transcription,
                    response.question.assignment.summary,
                  ),
                },
              ],
            },
          ],
        });

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON object found in response");
        }

        const analysis = JSON.parse(jsonMatch[0]) as {
          keyTakeaway: string;
          strengths: string[];
          improvements: string[];
        };

        // Update the response with the analysis
        const updatedResponse = await ctx.db.studentResponse.update({
          where: { id: input.responseId },
          data: {
            keyTakeaway: analysis.keyTakeaway,
            strengths: analysis.strengths,
            improvements: analysis.improvements,
          },
        });

        return updatedResponse;
      } catch (error) {
        console.error("Error analyzing response:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze response",
        });
      }
    }),
});
