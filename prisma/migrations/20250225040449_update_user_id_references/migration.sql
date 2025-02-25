/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_candidate_id_fkey";

-- AlterTable
ALTER TABLE "Challenge" ALTER COLUMN "creator_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Submission" ALTER COLUMN "candidate_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
