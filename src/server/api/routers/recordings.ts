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
        console.log(`Saving metadata for recording: ${input.filePath}`);
        
        // Extract the original question ID if it contains a timestamp
        const originalQuestionId = input.questionId.includes('_') 
          ? input.questionId.split('_')[0] 
          : input.questionId;
          
        console.log(`Original question ID: ${originalQuestionId} (from ${input.questionId})`);
        
        // First, find the submission for this position and user
        const submissionResult = await ctx.db.$queryRaw`
          SELECT "id" FROM "Submission"
          WHERE "candidate_id" = ${ctx.userId}
          AND "position_id" = ${input.positionId}::uuid
          LIMIT 1
        `;
        
        let submissionId: string;
        
        if (!Array.isArray(submissionResult) || submissionResult.length === 0) {
          console.log("No submission found, creating a new one");
          
          // Create a new submission
          const newSubmissionId = randomUUID();
          await ctx.db.$executeRaw`
            INSERT INTO "Submission" (
              "id", "candidate_id", "position_id", "status", 
              "started_at", "created_at", "updated_at"
            )
            VALUES (
              ${newSubmissionId}::uuid, ${ctx.userId}, ${input.positionId}::uuid, 'IN_PROGRESS',
              NOW(), NOW(), NOW()
            )
          `;
          
          submissionId = newSubmissionId;
        } else {
          submissionId = submissionResult[0].id;
        }
        
        console.log(`Using submission ID: ${submissionId}`);
        
        // Check if a SubmissionQuestion already exists for this submission and question
        const submissionQuestionResult = await ctx.db.$queryRaw`
          SELECT sq."id", rm."id" as recording_metadata_id
          FROM "SubmissionQuestion" sq
          LEFT JOIN "RecordingMetadata" rm ON rm."submission_question_id" = sq."id"
          WHERE sq."submission_id" = ${submissionId}::uuid
          AND sq."position_question_id" = ${originalQuestionId}::uuid
          LIMIT 1
        `;
        
        let submissionQuestionId: string;
        let hasExistingRecordingMetadata = false;
        
        if (!Array.isArray(submissionQuestionResult) || submissionQuestionResult.length === 0) {
          console.log("No submission question found, creating a new one");
          
          // Create a new submission question
          const newSubmissionQuestionId = randomUUID();
          await ctx.db.$executeRaw`
            INSERT INTO "SubmissionQuestion" (
              "id", "submission_id", "position_question_id", 
              "created_at", "updated_at"
            )
            VALUES (
              ${newSubmissionQuestionId}::uuid, ${submissionId}::uuid, ${originalQuestionId}::uuid,
              NOW(), NOW()
            )
          `;
          
          submissionQuestionId = newSubmissionQuestionId;
        } else {
          submissionQuestionId = submissionQuestionResult[0].id;
          hasExistingRecordingMetadata = !!submissionQuestionResult[0].recording_metadata_id;
        }
        
        console.log(`Using submission question ID: ${submissionQuestionId}`);
        
        // Handle recording metadata based on whether it already exists
        if (hasExistingRecordingMetadata) {
          console.log(`Updating existing recording metadata for submission question ${submissionQuestionId}`);
          
          // Update the existing record
          await ctx.db.$executeRaw`
            UPDATE "RecordingMetadata"
            SET 
              "filePath" = ${input.filePath}, 
              "fileSize" = ${input.fileSize || null}, 
              "durationSeconds" = ${input.durationSeconds || null},
              "updatedAt" = NOW()
            WHERE "submission_question_id" = ${submissionQuestionId}::uuid
          `;
        } else {
          console.log(`Creating new recording metadata for submission question ${submissionQuestionId}`);
          
          // Create a new recording metadata record
          await ctx.db.$executeRaw`
            INSERT INTO "RecordingMetadata" (
              "id", "createdAt", "updatedAt", "candidateId", "positionId", 
              "questionId", "filePath", "fileSize", "durationSeconds", "processed",
              "submission_question_id"
            ) 
            VALUES (
              ${randomUUID()}, NOW(), NOW(), ${ctx.userId}, ${input.positionId}::uuid, 
              ${input.questionId}, ${input.filePath}, ${input.fileSize || null}, ${input.durationSeconds || null}, false,
              ${submissionQuestionId}::uuid
            )
          `;
        }

        return { success: true, submissionQuestionId };
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
        // Extract the original question ID if it contains a timestamp
        const originalQuestionId = input.questionId.includes('_') 
          ? input.questionId.split('_')[0] 
          : input.questionId;
        
        console.log(`Original question ID: ${originalQuestionId} (from ${input.questionId})`);
        
        // Use a direct SQL query to avoid Prisma typing issues during transition
        console.log(`Finding submission for position ${input.positionId} and user ${ctx.userId}`);
        
        // First, find the submission ID for this position and user
        const submissionResult = await ctx.db.$queryRaw`
          SELECT "id" FROM "Submission"
          WHERE "candidate_id" = ${ctx.userId}
          AND "position_id" = ${input.positionId}::uuid
          LIMIT 1
        `;
        
        let submissionId: string;
        
        if (!Array.isArray(submissionResult) || submissionResult.length === 0) {
          console.log("No submission found, creating a new one");
          
          // Create a new submission if none exists
          const newSubmissionId = randomUUID();
          await ctx.db.$executeRaw`
            INSERT INTO "Submission" (
              "id", "candidate_id", "position_id", "status", 
              "started_at", "created_at", "updated_at"
            )
            VALUES (
              ${newSubmissionId}::uuid, ${ctx.userId}, ${input.positionId}::uuid, 'IN_PROGRESS',
              NOW(), NOW(), NOW()
            )
          `;
          
          submissionId = newSubmissionId;
        } else {
          submissionId = submissionResult[0].id;
        }
        
        console.log(`Using submission ID: ${submissionId}`);
        
        // Check if a SubmissionQuestion already exists for this submission and question
        const submissionQuestionResult = await ctx.db.$queryRaw`
          SELECT "id" FROM "SubmissionQuestion"
          WHERE "submission_id" = ${submissionId}::uuid
          AND "position_question_id" = ${originalQuestionId}::uuid
          LIMIT 1
        `;
        
        let submissionQuestionId: string;
        let isNewQuestion = false;
        
        if (!Array.isArray(submissionQuestionResult) || submissionQuestionResult.length === 0) {
          console.log("No submission question found, creating a new one");
          
          // Create a new submission question
          submissionQuestionId = randomUUID();
          await ctx.db.$executeRaw`
            INSERT INTO "SubmissionQuestion" (
              "id", "submission_id", "position_question_id", 
              "overall_assessment", "strengths", "areas_of_improvement", "skills_demonstrated",
              "created_at", "updated_at"
            )
            VALUES (
              ${submissionQuestionId}::uuid, ${submissionId}::uuid, ${originalQuestionId}::uuid,
              ${input.overall_assessment}, ${input.strengths}, ${input.areas_for_improvement}, ${input.skills_demonstrated},
              NOW(), NOW()
            )
          `;
          isNewQuestion = true;
        } else {
          submissionQuestionId = submissionQuestionResult[0].id;
          
          // Update the existing submission question
          await ctx.db.$executeRaw`
            UPDATE "SubmissionQuestion" SET
              "overall_assessment" = ${input.overall_assessment},
              "strengths" = ${input.strengths},
              "areas_of_improvement" = ${input.areas_for_improvement},
              "skills_demonstrated" = ${input.skills_demonstrated},
              "updated_at" = NOW()
            WHERE "id" = ${submissionQuestionId}::uuid
          `;
        }
        
        return { 
          success: true,
          submissionQuestionId,
          isNewQuestion
        };
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
          position_question_id: string;
          overall_assessment: string | null;
          strengths: string[];
          areas_of_improvement: string[];
          skills_demonstrated: string[];
          created_at: Date;
        };
        
        // Use raw SQL to fetch the analysis results to avoid Prisma typing issues
        const analysisResults = await ctx.db.$queryRaw<AnalysisResult[]>`
          SELECT sq."id", sq."position_question_id", sq."overall_assessment", 
                 sq."strengths", sq."areas_of_improvement", sq."skills_demonstrated", 
                 sq."created_at"
          FROM "SubmissionQuestion" sq
          JOIN "Submission" s ON sq."submission_id" = s."id"
          WHERE s."candidate_id" = ${ctx.userId}
          AND s."position_id" = ${input.positionId}::uuid
          ORDER BY sq."updated_at" DESC
        `;
        
        return { 
          results: analysisResults.map((result: AnalysisResult) => ({
            id: result.id,
            questionId: result.position_question_id,
            overall_assessment: result.overall_assessment || "",
            strengths: result.strengths || [],
            areas_for_improvement: result.areas_of_improvement || [],
            skills_demonstrated: result.skills_demonstrated || [],
            createdAt: result.created_at
          }))
        };
      } catch (error) {
        console.error("Error fetching analysis results:", error);
        throw new Error("Failed to fetch analysis results");
      }
    }),

  // Analyze a video recording for a specific question
  analyzeVideo: protectedProcedure
    .input(
      z.object({
        videoUrl: z.string(),
        question: z.string(),
        context: z.string().nullable(),
        questionContext: z.string().nullable(),
        positionId: z.string(),
        questionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Extract the original question ID if it contains a timestamp
      const originalQuestionId = input.questionId.includes('_') 
        ? input.questionId.split('_')[0] 
        : input.questionId;
      
      console.log(`Original question ID: ${originalQuestionId} (from ${input.questionId})`);
      
      // Only the user who owns the recording can analyze it
      console.log(`Checking recording permissions for path: ${input.videoUrl}`);

      // Use a direct SQL query to verify this recording belongs to the current user
      const recordingResult = await ctx.db.$queryRaw`
        SELECT rm."id" 
        FROM "RecordingMetadata" rm
        JOIN "SubmissionQuestion" sq ON rm."submission_question_id" = sq."id"
        JOIN "Submission" s ON sq."submission_id" = s."id"
        WHERE rm."filePath" = ${input.videoUrl}
        AND s."candidate_id" = ${ctx.userId}
        LIMIT 1
      `;

      // If no recording is found, throw an error
      if (!Array.isArray(recordingResult) || recordingResult.length === 0) {
        console.warn(`No recording found with path ${input.videoUrl} for user ${ctx.userId}`);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recording not found",
        });
      }

      try {
        console.log("Getting video download URL from Supabase");
        
        // Generate a download URL for the video
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(input.videoUrl, 3600);
        
        if (error) {
          console.error("Error creating download URL:", error);
          throw new Error("Failed to generate download URL");
        }
        
        if (!data || !data.signedUrl) {
          throw new Error("No download URL generated");
        }
        
        const downloadUrl = data.signedUrl;
        
        console.log("Downloading video for analysis");
        
        // Download the video
        const videoResponse = await fetch(downloadUrl);
        if (!videoResponse.ok) {
          throw new Error(`Failed to download video: ${videoResponse.status}`);
        }
        
        const videoBlob = await videoResponse.blob();
        console.log(`Video downloaded, size: ${videoBlob.size} bytes`);
        
        // Pass to the Gemini API for analysis
        const analysisResult = await analyzeVideoResponse(
          videoBlob,
          input.question,
          input.context,
          input.questionContext
        );
        
        console.log("Analysis completed");
        
        // Update the recording metadata to mark it as processed
        await ctx.db.$executeRaw`
          UPDATE "RecordingMetadata" 
          SET "processed" = true,
              "updatedAt" = NOW()
          WHERE "filePath" = ${input.videoUrl}
        `;
        
        return analysisResult;
      } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video");
      }
    }),
}); 