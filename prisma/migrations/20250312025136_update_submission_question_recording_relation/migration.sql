/*
  Warnings:

  - You are about to drop the column `file_path` on the `SubmissionQuestion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[submission_question_id]` on the table `RecordingMetadata` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `submission_question_id` to the `RecordingMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecordingMetadata" ADD COLUMN     "submission_question_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "SubmissionQuestion" DROP COLUMN "file_path";

-- CreateIndex
CREATE UNIQUE INDEX "RecordingMetadata_submission_question_id_key" ON "RecordingMetadata"("submission_question_id");

-- AddForeignKey
ALTER TABLE "RecordingMetadata" ADD CONSTRAINT "RecordingMetadata_submission_question_id_fkey" FOREIGN KEY ("submission_question_id") REFERENCES "SubmissionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
