/*
  Warnings:

  - You are about to drop the column `audio_url` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `challenge_id` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `screen_url` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `transcript` on the `Submission` table. All the data in the column will be lost.
  - Added the required column `position_id` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_challenge_id_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "audio_url",
DROP COLUMN "challenge_id",
DROP COLUMN "feedback",
DROP COLUMN "screen_url",
DROP COLUMN "transcript",
ADD COLUMN     "position_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "SubmissionQuestion" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "position_question_id" UUID NOT NULL,
    "overall_assessment" TEXT,
    "strengths" TEXT,
    "areas_of_improvement" TEXT,
    "file_path" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SubmissionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionQuestion_submission_id_position_question_id_key" ON "SubmissionQuestion"("submission_id", "position_question_id");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionQuestion" ADD CONSTRAINT "SubmissionQuestion_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionQuestion" ADD CONSTRAINT "SubmissionQuestion_position_question_id_fkey" FOREIGN KEY ("position_question_id") REFERENCES "PositionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
