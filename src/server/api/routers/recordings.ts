import type { PrismaClient } from "@prisma/client";
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

// Define types for analysis result
interface AnalysisResultInput {
  overall_assessment?: string;
  strengths?: string[];
  areas_for_improvement?: string[];
  competency_assessments?: Array<{
    competency_id?: string;
    competency_name?: string;
    level?: number;
    rationale?: string;
  }>;
}

interface NormalizedAnalysisResult {
  overall_assessment: string;
  strengths: string[];
  areas_for_improvement: string[];
  competency_assessments: Array<{
    competency_id: string;
    competency_name: string;
    level: number;
    rationale: string;
  }>;
}

// Function to ensure analysis result has all required fields with proper types
function normalizeAnalysisResult(result: AnalysisResultInput): NormalizedAnalysisResult {
  return {
    overall_assessment: result.overall_assessment || '',
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    areas_for_improvement: Array.isArray(result.areas_for_improvement) ? result.areas_for_improvement : [],
    competency_assessments: Array.isArray(result.competency_assessments) 
      ? result.competency_assessments.map((assessment) => ({
          // Preserve the competency_id exactly as provided - could be numeric or string
          competency_id: assessment.competency_id || '',
          competency_name: assessment.competency_name || '',
          level: typeof assessment.level === 'number' ? Math.min(Math.max(assessment.level, 1), 5) : 3,
          rationale: assessment.rationale || ''
        }))
      : []
  };
}

// Auto-save analysis after video processing
async function autoSaveAnalysis(
  ctx: {
    db: PrismaClient;
    userId: string;
  }, 
  positionId: string, 
  questionId: string, 
  normalizedResult: NormalizedAnalysisResult
) {
  try {
    console.log("Attempting to auto-save analysis:");
    console.log(JSON.stringify(normalizedResult, null, 2));
    
    // Extract the original question ID if it contains a timestamp
    const originalQuestionId = questionId.includes('_') 
      ? questionId.split('_')[0] 
      : questionId;
    
    // Find the submission for this position and user
    const submissionResult = await ctx.db.$queryRaw`
      SELECT "id" FROM "Submission"
      WHERE "candidate_id" = ${ctx.userId}
      AND "position_id" = ${positionId}::uuid
      LIMIT 1
    `;
    
    let submissionId: string;
    
    if (!Array.isArray(submissionResult) || submissionResult.length === 0) {
      console.log("No submission found, creating a new one for auto-save");
      
      // Create a new submission
      const newSubmissionId = randomUUID();
      await ctx.db.$executeRaw`
        INSERT INTO "Submission" (
          "id", "candidate_id", "position_id", "status", 
          "started_at", "created_at", "updated_at"
        )
        VALUES (
          ${newSubmissionId}::uuid, ${ctx.userId}, ${positionId}::uuid, 'IN_PROGRESS',
          NOW(), NOW(), NOW()
        )
      `;
      
      submissionId = newSubmissionId;
    } else {
      submissionId = submissionResult[0].id;
    }
    
    // Check if a SubmissionQuestion already exists
    const submissionQuestionResult = await ctx.db.$queryRaw`
      SELECT "id" FROM "SubmissionQuestion"
      WHERE "submission_id" = ${submissionId}::uuid
      AND "position_question_id" = ${originalQuestionId}::uuid
      LIMIT 1
    `;
    
    let submissionQuestionId: string;
    
    if (!Array.isArray(submissionQuestionResult) || submissionQuestionResult.length === 0) {
      console.log("No submission question found, creating a new one for auto-save");
      
      // Create a new submission question
      const newSubmissionQuestionId = randomUUID();
      await ctx.db.$executeRaw`
        INSERT INTO "SubmissionQuestion" (
          "id", "submission_id", "position_question_id", "overall_assessment",
          "strengths", "areas_of_improvement", "created_at", "updated_at"
        )
        VALUES (
          ${newSubmissionQuestionId}::uuid, ${submissionId}::uuid, ${originalQuestionId}::uuid, ${normalizedResult.overall_assessment},
          ${normalizedResult.strengths}, ${normalizedResult.areas_for_improvement}, NOW(), NOW()
        )
      `;
      
      submissionQuestionId = newSubmissionQuestionId;
    } else {
      submissionQuestionId = submissionQuestionResult[0].id;
      console.log(`Updating existing submission question for auto-save: ${submissionQuestionId}`);
      
      // Update the existing submission question
      await ctx.db.$executeRaw`
        UPDATE "SubmissionQuestion"
        SET "overall_assessment" = ${normalizedResult.overall_assessment},
            "strengths" = ${normalizedResult.strengths},
            "areas_of_improvement" = ${normalizedResult.areas_for_improvement},
            "updated_at" = NOW()
        WHERE "id" = ${submissionQuestionId}::uuid
      `;
    }
    
    // Handle competency assessments
    if (normalizedResult.competency_assessments.length > 0) {
      console.log(`Auto-saving ${normalizedResult.competency_assessments.length} competency assessments`);
      
      for (const assessment of normalizedResult.competency_assessments) {
        // Try to find the competency by num_id first (if it's a number) or by UUID 
        const isNumericId = !isNaN(Number(assessment.competency_id));
        
        let competencyResult;
        if (isNumericId) {
          console.log(`Looking up competency by numeric ID: ${assessment.competency_id}`);
          competencyResult = await ctx.db.$queryRaw`
            SELECT "id" FROM "Competency"
            WHERE "num_id" = ${Number(assessment.competency_id)}
            LIMIT 1
          `;
        } else {
          console.log(`Looking up competency by UUID: ${assessment.competency_id}`);
          competencyResult = await ctx.db.$queryRaw`
            SELECT "id" FROM "Competency"
            WHERE "id" = ${assessment.competency_id}::uuid
            LIMIT 1
          `;
        }
        
        if (!Array.isArray(competencyResult) || competencyResult.length === 0) {
          console.warn(`No competency found with ID ${assessment.competency_id} for auto-save`);
          continue;
        }
        
        const competencyId = competencyResult[0].id;
        
        // Now get the questionCompetencyId for this competency
        const questionCompetencyResult = await ctx.db.$queryRaw`
          SELECT "id" FROM "QuestionCompetency"
          WHERE "question_id" = ${originalQuestionId}::uuid
          AND "competency_id" = ${competencyId}::uuid
          LIMIT 1
        `;
        
        if (!Array.isArray(questionCompetencyResult) || questionCompetencyResult.length === 0) {
          console.warn(`No QuestionCompetency found for auto-save: question ${originalQuestionId} and competency ${assessment.competency_id}`);
          continue;
        }
        
        const questionCompetencyId = questionCompetencyResult[0].id;
        
        // Check if an assessment already exists
        const existingAssessment = await ctx.db.$queryRaw`
          SELECT "id" FROM "SubmissionQuestionCompetency"
          WHERE "submission_question_id" = ${submissionQuestionId}::uuid
          AND "question_competency_id" = ${questionCompetencyId}::uuid
          LIMIT 1
        `;
        
        if (Array.isArray(existingAssessment) && existingAssessment.length > 0) {
          // Update existing assessment
          await ctx.db.$executeRaw`
            UPDATE "SubmissionQuestionCompetency"
            SET "level" = ${assessment.level},
                "rationale" = ${assessment.rationale},
                "updated_at" = NOW()
            WHERE "id" = ${existingAssessment[0].id}::uuid
          `;
        } else {
          // Create new assessment
          await ctx.db.$executeRaw`
            INSERT INTO "SubmissionQuestionCompetency" (
              "id", "submission_question_id", "question_competency_id", 
              "level", "rationale", "created_at", "updated_at"
            )
            VALUES (
              ${randomUUID()}::uuid, ${submissionQuestionId}::uuid, ${questionCompetencyId}::uuid,
              ${assessment.level}, ${assessment.rationale}, NOW(), NOW()
            )
          `;
        }
      }
    }
    
    console.log("Auto-save completed successfully");
    return true;
  } catch (error) {
    console.error("Error in auto-save:", error);
    return false;
  }
}

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
        strengths: z.array(z.string()).default([]),
        areas_for_improvement: z.array(z.string()).default([]),
        competency_assessments: z.array(
          z.object({
            competency_id: z.string(),
            competency_name: z.string(),
            level: z.number().min(1).max(5),
            rationale: z.string(),
          })
        ).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Log the input for debugging
        console.log("==== SAVE ANALYSIS INPUT ====");
        console.log(`positionId: ${input.positionId}`);
        console.log(`questionId: ${input.questionId}`);
        console.log(`overall_assessment length: ${input.overall_assessment?.length || 0}`);
        console.log(`strengths: ${input.strengths.length} items`);
        console.log(`areas_for_improvement: ${input.areas_for_improvement.length} items`);
        console.log(`competency_assessments: ${input.competency_assessments.length} items`);
        console.log("=============================");

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
        
        if (!Array.isArray(submissionQuestionResult) || submissionQuestionResult.length === 0) {
          console.log("No submission question found, creating a new one");
          
          // Create a new submission question
          const newSubmissionQuestionId = randomUUID();
          await ctx.db.$executeRaw`
            INSERT INTO "SubmissionQuestion" (
              "id", "submission_id", "position_question_id", "overall_assessment",
              "strengths", "areas_of_improvement", "created_at", "updated_at"
            )
            VALUES (
              ${newSubmissionQuestionId}::uuid, ${submissionId}::uuid, ${originalQuestionId}::uuid, ${input.overall_assessment},
              ${input.strengths}, ${input.areas_for_improvement}, NOW(), NOW()
            )
          `;
          
          submissionQuestionId = newSubmissionQuestionId;
        } else {
          submissionQuestionId = submissionQuestionResult[0].id;
          console.log(`Updating existing submission question: ${submissionQuestionId}`);
          
          // Update the existing submission question
          await ctx.db.$executeRaw`
            UPDATE "SubmissionQuestion"
            SET "overall_assessment" = ${input.overall_assessment},
                "strengths" = ${input.strengths},
                "areas_of_improvement" = ${input.areas_for_improvement},
                "updated_at" = NOW()
            WHERE "id" = ${submissionQuestionId}::uuid
          `;
        }
        
        // Now handle competency assessments
        if (input.competency_assessments && input.competency_assessments.length > 0) {
          console.log(`Processing ${input.competency_assessments.length} competency assessments`);
          
          for (const assessment of input.competency_assessments) {
            // Try to find the competency by num_id first (if it's a number) or by UUID 
            const isNumericId = !isNaN(Number(assessment.competency_id));
            
            let competencyResult;
            if (isNumericId) {
              console.log(`Looking up competency by numeric ID: ${assessment.competency_id}`);
              competencyResult = await ctx.db.$queryRaw`
                SELECT "id" FROM "Competency"
                WHERE "num_id" = ${Number(assessment.competency_id)}
                LIMIT 1
              `;
            } else {
              console.log(`Looking up competency by UUID: ${assessment.competency_id}`);
              competencyResult = await ctx.db.$queryRaw`
                SELECT "id" FROM "Competency"
                WHERE "id" = ${assessment.competency_id}::uuid
                LIMIT 1
              `;
            }
            
            if (!Array.isArray(competencyResult) || competencyResult.length === 0) {
              console.warn(`No competency found with ID ${assessment.competency_id}`);
              continue;
            }
            
            const competencyId = competencyResult[0].id;
            
            // Get the questionCompetencyId for this competency using the UUID
            const questionCompetencyResult = await ctx.db.$queryRaw`
              SELECT "id" FROM "QuestionCompetency"
              WHERE "question_id" = ${originalQuestionId}::uuid
              AND "competency_id" = ${competencyId}::uuid
              LIMIT 1
            `;
            
            if (!Array.isArray(questionCompetencyResult) || questionCompetencyResult.length === 0) {
              console.warn(`No QuestionCompetency found for question ${originalQuestionId} and competency ${assessment.competency_id}`);
              continue;
            }
            
            const questionCompetencyId = questionCompetencyResult[0].id;
            
            // Check if an assessment already exists
            const existingAssessment = await ctx.db.$queryRaw`
              SELECT "id" FROM "SubmissionQuestionCompetency"
              WHERE "submission_question_id" = ${submissionQuestionId}::uuid
              AND "question_competency_id" = ${questionCompetencyId}::uuid
              LIMIT 1
            `;
            
            if (Array.isArray(existingAssessment) && existingAssessment.length > 0) {
              // Update existing assessment
              await ctx.db.$executeRaw`
                UPDATE "SubmissionQuestionCompetency"
                SET "level" = ${assessment.level},
                    "rationale" = ${assessment.rationale},
                    "updated_at" = NOW()
                WHERE "id" = ${existingAssessment[0].id}::uuid
              `;
            } else {
              // Create new assessment
              await ctx.db.$executeRaw`
                INSERT INTO "SubmissionQuestionCompetency" (
                  "id", "submission_question_id", "question_competency_id", 
                  "level", "rationale", "created_at", "updated_at"
                )
                VALUES (
                  ${randomUUID()}::uuid, ${submissionQuestionId}::uuid, ${questionCompetencyId}::uuid,
                  ${assessment.level}, ${assessment.rationale}, NOW(), NOW()
                )
              `;
            }
          }
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error saving analysis results:", error);
        throw new Error("Failed to save analysis results");
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

  // Get analysis results for a position
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
          created_at: Date;
        };

        type CompetencyAssessment = {
          competency_id: string;
          competency_name: string;
          level: number;
          rationale: string;
        };
        
        // Use raw SQL to fetch the analysis results
        const analysisResults = await ctx.db.$queryRaw<AnalysisResult[]>`
          SELECT sq."id", sq."position_question_id", sq."overall_assessment", 
                 sq."strengths", sq."areas_of_improvement", sq."created_at"
          FROM "SubmissionQuestion" sq
          JOIN "Submission" s ON sq."submission_id" = s."id"
          WHERE s."candidate_id" = ${ctx.userId}
          AND s."position_id" = ${input.positionId}::uuid
          ORDER BY sq."updated_at" DESC
        `;

        // For each submission question, fetch the competency assessments
        const resultsWithCompetencies = [];
        
        for (const result of analysisResults) {
          // Fetch competency assessments for this submission question
          const competencyAssessments = await ctx.db.$queryRaw<CompetencyAssessment[]>`
            SELECT 
              c."id" as competency_id,
              c."name" as competency_name,
              sqc."level",
              sqc."rationale"
            FROM "SubmissionQuestionCompetency" sqc
            JOIN "QuestionCompetency" qc ON sqc."question_competency_id" = qc."id"
            JOIN "Competency" c ON qc."competency_id" = c."id"
            WHERE sqc."submission_question_id" = ${result.id}::uuid
          `;
          
          resultsWithCompetencies.push({
            id: result.id,
            questionId: result.position_question_id,
            overall_assessment: result.overall_assessment || "",
            strengths: result.strengths || [],
            areas_for_improvement: result.areas_of_improvement || [],
            competency_assessments: competencyAssessments || [],
            createdAt: result.created_at
          });
        }
        
        return { results: resultsWithCompetencies };
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
        
        // Fetch competencies for this question
        console.log(`Fetching competencies for question ${originalQuestionId}`);
        
        // First get questionCompetency entries
        const questionCompetenciesResult = await ctx.db.$queryRaw`
          SELECT qc."id", qc."competency_id"
          FROM "QuestionCompetency" qc
          WHERE qc."question_id" = ${originalQuestionId}::uuid
        `;
        
        // Prepare competencies array with rubrics
        const competencies = [];
        
        if (Array.isArray(questionCompetenciesResult) && questionCompetenciesResult.length > 0) {
          for (const qc of questionCompetenciesResult) {
            // Get competency details with rubric levels
            const competencyResult = await ctx.db.$queryRaw`
              SELECT 
                c."id", 
                c."name",
                c."num_id",
                c."level_1_inadequate", 
                c."level_2_needs_guidance", 
                c."level_3_competent", 
                c."level_4_proficient", 
                c."level_5_exceptional"
              FROM "Competency" c
              WHERE c."id" = ${qc.competency_id}::uuid
            `;
            
            if (Array.isArray(competencyResult) && competencyResult.length > 0) {
              const comp = competencyResult[0];
              
              // Format the competency with its rubric for the LLM
              competencies.push({
                id: comp.num_id || comp.id, // Use numeric ID if available, or fall back to UUID
                name: comp.name,
                description: null,
                rubric: [
                  { level: 1, description: comp.level_1_inadequate || "Inadequate" },
                  { level: 2, description: comp.level_2_needs_guidance || "Needs Guidance" },
                  { level: 3, description: comp.level_3_competent || "Competent" },
                  { level: 4, description: comp.level_4_proficient || "Proficient" },
                  { level: 5, description: comp.level_5_exceptional || "Exceptional" }
                ]
              });
            }
          }
        }
        
        console.log(`Found ${competencies.length} competencies for the question`);
        
        // Pass to the Gemini API for analysis with competencies
        const analysisResult = await analyzeVideoResponse(
          videoBlob,
          input.question,
          input.context,
          input.questionContext,
          competencies
        );
        
        console.log("Analysis completed");
        
        // Log the complete analysis result
        console.log("==== ANALYSIS RESULT STRUCTURE ====");
        console.log(`overall_assessment: ${analysisResult.overall_assessment ? "present" : "missing"}`);
        console.log(`strengths: ${analysisResult.strengths ? `array[${analysisResult.strengths.length}]` : "missing"}`);
        console.log(`areas_for_improvement: ${analysisResult.areas_for_improvement ? `array[${analysisResult.areas_for_improvement.length}]` : "missing"}`);
        console.log(`competency_assessments: ${analysisResult.competency_assessments ? `array[${analysisResult.competency_assessments.length}]` : "missing"}`);
        console.log("=================================");
        
        // Normalize the analysis result
        const normalizedResult = normalizeAnalysisResult(analysisResult);
        
        // Update the recording metadata to mark it as processed
        await ctx.db.$executeRaw`
          UPDATE "RecordingMetadata" 
          SET "processed" = true,
              "updatedAt" = NOW()
          WHERE "filePath" = ${input.videoUrl}
        `;
        
        // Try to auto-save the analysis result
        void autoSaveAnalysis(ctx, input.positionId, input.questionId, normalizedResult);
        
        // Return the normalized result
        return normalizedResult;
      } catch (error) {
        console.error("Error analyzing video:", error);
        throw new Error("Failed to analyze video");
      }
    }),

  // Get a signed URL for an existing file
  getSignedUrl: protectedProcedure
    .input(z.object({
      filePath: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log(`Getting signed URL for: ${input.filePath}`);
        
        // Generate a signed URL with a 1 hour expiry
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(input.filePath, 3600);

        if (error) {
          console.error("Error creating signed URL:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate signed URL",
          });
        }

        return { 
          url: data.signedUrl,
          success: true
        };
      } catch (error) {
        console.error("Error in getSignedUrl:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to generate signed URL"
        });
      }
    }),
}); 