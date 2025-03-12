/*
  Warnings:

  - You are about to alter the column `durationSeconds` on the `RecordingMetadata` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- DropIndex
DROP INDEX "RecordingMetadata_candidateId_positionId_idx";

-- DropIndex
DROP INDEX "RecordingMetadata_questionId_idx";

-- AlterTable
ALTER TABLE "Competency" ADD COLUMN     "level_1_inadequate" TEXT,
ADD COLUMN     "level_2_needs_guidance" TEXT,
ADD COLUMN     "level_3_competent" TEXT,
ADD COLUMN     "level_4_proficient" TEXT,
ADD COLUMN     "level_5_exceptional" TEXT;

-- AlterTable
ALTER TABLE "RecordingMetadata" ALTER COLUMN "durationSeconds" SET DATA TYPE INTEGER;
