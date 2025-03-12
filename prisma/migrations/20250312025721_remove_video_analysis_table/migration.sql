/*
  Warnings:

  - The `strengths` column on the `SubmissionQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `areas_of_improvement` column on the `SubmissionQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `VideoAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "SubmissionQuestion" ADD COLUMN     "skills_demonstrated" TEXT[],
DROP COLUMN "strengths",
ADD COLUMN     "strengths" TEXT[],
DROP COLUMN "areas_of_improvement",
ADD COLUMN     "areas_of_improvement" TEXT[];

-- DropTable
DROP TABLE "VideoAnalysis";
