/*
  Warnings:

  - You are about to drop the `QuestionCompetency` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[num_id]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[num_id]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[num_id]` on the table `SubSkill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skills_assessed` to the `PositionQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "QuestionCompetency" DROP CONSTRAINT "QuestionCompetency_competency_id_fkey";

-- DropForeignKey
ALTER TABLE "QuestionCompetency" DROP CONSTRAINT "QuestionCompetency_question_id_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "num_id" INTEGER;

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "status" "PositionStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PositionQuestion" ADD COLUMN     "skills_assessed" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "num_id" INTEGER;

-- AlterTable
ALTER TABLE "SubSkill" ADD COLUMN     "num_id" INTEGER;

-- DropTable
DROP TABLE "QuestionCompetency";

-- CreateTable
CREATE TABLE "PositionSkill" (
    "id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "category_name" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "competencies" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PositionSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_num_id_key" ON "Category"("num_id");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_num_id_key" ON "Skill"("num_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubSkill_num_id_key" ON "SubSkill"("num_id");

-- AddForeignKey
ALTER TABLE "PositionSkill" ADD CONSTRAINT "PositionSkill_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
