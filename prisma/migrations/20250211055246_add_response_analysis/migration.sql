/*
  Warnings:

  - Made the column `transcription` on table `StudentResponse` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StudentResponse" ADD COLUMN     "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "keyTakeaway" TEXT,
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "transcription" SET NOT NULL;
