/*
  Warnings:

  - You are about to drop the column `department` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `skills_assessed` on the `PositionQuestion` table. All the data in the column will be lost.
  - You are about to drop the `PositionSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Criterion" DROP CONSTRAINT "Criterion_sub_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "PositionSkill" DROP CONSTRAINT "PositionSkill_position_id_fkey";

-- DropForeignKey
ALTER TABLE "SubSkill" DROP CONSTRAINT "SubSkill_skill_id_fkey";

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "department",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "PositionQuestion" DROP COLUMN "skills_assessed";

-- DropTable
DROP TABLE "PositionSkill";

-- DropTable
DROP TABLE "SubSkill";

-- DropEnum
DROP TYPE "PositionStatus";

-- CreateTable
CREATE TABLE "Competency" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "num_id" INTEGER,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCompetency" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "QuestionCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Competency_num_id_key" ON "Competency"("num_id");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_skill_id_name_key" ON "Competency"("skill_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionCompetency_question_id_competency_id_key" ON "QuestionCompetency"("question_id", "competency_id");

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criterion" ADD CONSTRAINT "Criterion_sub_skill_id_fkey" FOREIGN KEY ("sub_skill_id") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCompetency" ADD CONSTRAINT "QuestionCompetency_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "PositionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCompetency" ADD CONSTRAINT "QuestionCompetency_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
