/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `timeLimit` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Criterion` table. All the data in the column will be lost.
  - You are about to drop the column `subSkillId` on the `Criterion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Criterion` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `SubSkill` table. All the data in the column will be lost.
  - You are about to drop the column `skillId` on the `SubSkill` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `SubSkill` table. All the data in the column will be lost.
  - You are about to drop the column `audioUrl` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `candidateId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `challengeId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `screenUrl` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category_id,name]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[skill_id,name]` on the table `SubSkill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sub_skill_id` to the `Criterion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Criterion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill_id` to the `SubSkill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `SubSkill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidate_id` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `challenge_id` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Criterion" DROP CONSTRAINT "Criterion_subSkillId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "SubSkill" DROP CONSTRAINT "SubSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_challengeId_fkey";

-- DropIndex
DROP INDEX "Skill_categoryId_name_key";

-- DropIndex
DROP INDEX "SubSkill_skillId_name_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "createdAt",
DROP COLUMN "creatorId",
DROP COLUMN "timeLimit",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creator_id" TEXT NOT NULL,
ADD COLUMN     "time_limit" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Criterion" DROP COLUMN "createdAt",
DROP COLUMN "subSkillId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sub_skill_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "categoryId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "category_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SubSkill" DROP COLUMN "createdAt",
DROP COLUMN "skillId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "skill_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "audioUrl",
DROP COLUMN "candidateId",
DROP COLUMN "challengeId",
DROP COLUMN "completedAt",
DROP COLUMN "createdAt",
DROP COLUMN "screenUrl",
DROP COLUMN "startedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "audio_url" TEXT,
ADD COLUMN     "candidate_id" TEXT NOT NULL,
ADD COLUMN     "challenge_id" TEXT NOT NULL,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "screen_url" TEXT,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Skill_category_id_name_key" ON "Skill"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SubSkill_skill_id_name_key" ON "SubSkill"("skill_id", "name");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSkill" ADD CONSTRAINT "SubSkill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criterion" ADD CONSTRAINT "Criterion_sub_skill_id_fkey" FOREIGN KEY ("sub_skill_id") REFERENCES "SubSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
