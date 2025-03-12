import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { analyzeVideoResponse } from "~/lib/gemini/analyzeVideo";
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

  // Save AI analysis results for a video response
  saveAnalysis: protectedProcedure
    .input(
      z.object({
        positionId: z.string(),
        questionId: z.string(),
        overall_assessment: z.string(),
        strengths: z.array(z.string()),
        areas_for_improvement: z.array(z.string()),
        skills_demonstrated: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create a new video analysis record using raw SQL since the Prisma model is having issues
        await ctx.db.$executeRaw`
          INSERT INTO "VideoAnalysis" (
            "id", "createdAt", "updatedAt", "candidateId", "positionId", "questionId",
            "overall_assessment", "strengths", "areas_for_improvement", "skills_demonstrated"
          )
          VALUES (
            ${randomUUID()}, NOW(), NOW(), ${ctx.userId}, ${input.positionId}, ${input.questionId},
            ${input.overall_assessment}, ${input.strengths}, ${input.areas_for_improvement}, ${input.skills_demonstrated}
          )
          ON CONFLICT ("candidateId", "positionId", "questionId") 
          DO UPDATE SET
            "overall_assessment" = ${input.overall_assessment},
            "strengths" = ${input.strengths},
            "areas_for_improvement" = ${input.areas_for_improvement},
            "skills_demonstrated" = ${input.skills_demonstrated},
            "updatedAt" = NOW()
        `;

        return { success: true };
      } catch (error) {
        console.error("Error saving video analysis:", error);
        throw new Error("Failed to save video analysis");
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

  // Get analysis results for recordings
  getAnalysisResults: protectedProcedure
    .input(
      z.object({
        positionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Define the return type for clarity
        type AnalysisResult = {
          id: string;
          questionId: string; 
          overall_assessment: string;
          strengths: string[];
          areas_for_improvement: string[];
          skills_demonstrated: string[];
          createdAt: Date;
        };
        
        // Get all analysis results for this user and position using raw SQL
        const analysisResults = await ctx.db.$queryRaw<AnalysisResult[]>`
          SELECT 
            "id", "questionId", "overall_assessment", 
            "strengths", "areas_for_improvement", "skills_demonstrated", 
            "createdAt"
          FROM "VideoAnalysis"
          WHERE "candidateId" = ${ctx.userId}
          AND "positionId" = ${input.positionId}
          ORDER BY "updatedAt" DESC
        `;

        return { 
          results: analysisResults.map((result: AnalysisResult) => {
            // Extract original question ID if the stored ID has our special format (contains underscore)
            const originalQuestionId = result.questionId.includes('_') 
              ? result.questionId.split('_')[0] 
              : result.questionId;
            
            return {
              id: result.id,
              questionId: originalQuestionId,
              overall_assessment: result.overall_assessment,
              strengths: result.strengths,
              areas_for_improvement: result.areas_for_improvement,
              skills_demonstrated: result.skills_demonstrated,
              createdAt: result.createdAt
            };
          })
        };
      } catch (error) {
        console.error("Error fetching analysis results:", error);
        throw new Error("Failed to fetch analysis results");
      }
    }),

  // Analyze a video recording using Gemini AI
  analyzeVideo: protectedProcedure
    .input(
      z.object({
        videoUrl: z.string().optional(),
        question: z.string(),
        context: z.string().nullable(),
        questionContext: z.string().nullable().optional(),
        positionId: z.string(),
        questionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`Attempting to analyze video for question ${input.questionId}`);
        console.log(`Video URL: ${input.videoUrl ? input.videoUrl.substring(0, 30) + '...' : 'Not provided'}`);
        
        let videoData: Uint8Array | null = null;

        // If videoUrl was provided, try to download it directly
        if (input.videoUrl) {
          console.log(`Attempting direct download with provided videoUrl...`);
          const downloadResult = await supabase.storage
            .from(BUCKET_NAME)
            .download(input.videoUrl);
          
          if (downloadResult.error || !downloadResult.data) {
            console.error("Error downloading video:", downloadResult.error);
            console.log(`Direct download failed, will try fallback method...`);
          } else {
            console.log(`Direct download successful! Got ${downloadResult.data.size} bytes`);
            videoData = new Uint8Array(await downloadResult.data.arrayBuffer());
          }
        }

        // If we still don't have video data, try to find it in the database
        if (!videoData) {
          console.log(`Looking up recording in database by questionId: ${input.questionId}`);
          
          try {
            // Find recording associated with this questionId and positionId
            const recording = await ctx.db.$queryRaw`
              SELECT * FROM Recording
              WHERE "questionId" = ${input.questionId}
              AND "positionId" = ${input.positionId}
              ORDER BY "createdAt" DESC
              LIMIT 1
            `;
            
            if (!Array.isArray(recording) || recording.length === 0) {
              console.error(`No recording found for question ${input.questionId}`);
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `No recording found for question ${input.questionId}`,
              });
            }
            
            console.log(`Found recording: ${JSON.stringify(recording[0], null, 2)}`);
            const filePath = recording[0].filePath;
            
            if (!filePath) {
              console.error(`No file path found for question ${input.questionId}`);
              throw new TRPCError({
                code: "NOT_FOUND", 
                message: `No file path found for question ${input.questionId}`,
              });
            }
            
            // Now we need to download the file from supabase storage
            console.log(`Downloading video from storage, path: ${filePath}`);
            const downloadResult = await supabase.storage
              .from(BUCKET_NAME)
              .download(filePath);
            
            if (downloadResult.error || !downloadResult.data) {
              console.error("Error downloading video from database path:", downloadResult.error);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to download the video recording",
              });
            }

            console.log(`Successfully downloaded video from database path, size: ${downloadResult.data.size} bytes`);
            videoData = new Uint8Array(await downloadResult.data.arrayBuffer());
          } catch (dbError) {
            console.error("Error querying database for recording:", dbError);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to retrieve recording from database",
            });
          }
        }

        // Convert to blob
        const videoBlob = new Blob([videoData as Uint8Array], { type: "video/webm" });
        console.log(`Created video blob, size: ${videoBlob.size} bytes`);

        // Analyze the video
        console.log(`Starting video analysis with Gemini...`);
        const analysisResult = await analyzeVideoResponse(
          videoBlob, 
          input.question, 
          input.context,
          input.questionContext
        );
        console.log(`Analysis completed successfully!`);

        return analysisResult;
      } catch (error) {
        console.error("Error analyzing video:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze the video recording",
        });
      }
    }),
}); 