import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Supabase client for storage operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Define the bucket name to be used for recordings
const BUCKET_NAME = "candidate-recordings";

export const recordingsRouter = createTRPCRouter({
  // Get a signed URL for uploading a recording
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        positionId: z.string(),
        contentType: z.string().default("video/webm"),
        extension: z.string().default("webm"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate a unique file path
        const fileName = `${randomUUID()}.${input.extension}`;
        const filePath = `${ctx.userId}/${input.positionId}/${input.questionId}/${fileName}`;

        // Get a signed URL for uploading
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUploadUrl(filePath);

        if (error) {
          console.error("Error creating signed URL:", error);
          throw new Error("Failed to create upload URL");
        }

        return {
          signedUrl: data.signedUrl,
          filePath: filePath,
        };
      } catch (error) {
        console.error("Error in getUploadUrl:", error);
        throw new Error("Failed to generate upload URL");
      }
    }),

  // Save metadata about an uploaded recording
  saveMetadata: protectedProcedure
    .input(
      z.object({
        positionId: z.string(),
        questionId: z.string(),
        filePath: z.string(),
        fileSize: z.number().optional(),
        durationSeconds: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Since we're having issues with the model naming, let's create a direct query
        // This is a temporary workaround - in production, you'd want to use the proper Prisma model
        const result = await ctx.db.$executeRaw`
          INSERT INTO "RecordingMetadata" (
            "id", "createdAt", "updatedAt", "candidateId", "positionId", 
            "questionId", "filePath", "fileSize", "durationSeconds", "processed"
          ) 
          VALUES (
            ${randomUUID()}, NOW(), NOW(), ${ctx.userId}, ${input.positionId}, 
            ${input.questionId}, ${input.filePath}, ${input.fileSize || null}, ${input.durationSeconds || null}, false
          )
        `;

        return { success: true };
      } catch (error) {
        console.error("Error saving recording metadata:", error);
        throw new Error("Failed to save recording metadata");
      }
    }),

  // Get recordings for a specific position by the current user
  getRecordings: protectedProcedure
    .input(
      z.object({
        positionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get all recordings for this user and position using standard Prisma query
        // This replaces the raw SQL query to avoid connection pooling issues
        const recordings = await ctx.db.recordingMetadata.findMany({
          where: {
            candidateId: ctx.userId,
            positionId: input.positionId,
          },
          select: {
            id: true,
            filePath: true,
            questionId: true,
            fileSize: true,
            durationSeconds: true,
            createdAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        });

        // For each recording, generate a signed URL for downloading
        const recordingsWithUrls = await Promise.all(
          recordings.map(async (record) => {
            const { data, error } = await supabase.storage
              .from(BUCKET_NAME)
              .createSignedUrl(record.filePath, 3600); // 1 hour expiry

            if (error) {
              console.error("Error creating signed URL:", error);
              return {
                ...record,
                url: null,
              };
            }

            return {
              ...record,
              url: data.signedUrl,
            };
          })
        );

        return { 
          recordings: recordingsWithUrls.map(record => {
            // Extract original question ID if the stored ID has our special format (contains underscore)
            const originalQuestionId = record.questionId.includes('_') 
              ? record.questionId.split('_')[0] 
              : record.questionId;
            
            return {
              id: record.id,
              questionId: originalQuestionId, // Use the original question ID for client
              recordingId: record.questionId, // Keep the full recording ID for reference
              url: record.url,
              filePath: record.filePath,
              fileSize: record.fileSize,
              durationSeconds: record.durationSeconds,
              createdAt: record.createdAt
            };
          })
        };
      } catch (error) {
        console.error("Error fetching recordings:", error);
        throw new Error("Failed to fetch recordings");
      }
    }),
}); 