/*
  Warnings:

  - Added the required column `summary` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column as nullable
ALTER TABLE "Assignment" ADD COLUMN "summary" TEXT;

-- Update existing rows with a default summary
UPDATE "Assignment" SET "summary" = 'No summary available for this assignment.';

-- Make the column required
ALTER TABLE "Assignment" ALTER COLUMN "summary" SET NOT NULL;
