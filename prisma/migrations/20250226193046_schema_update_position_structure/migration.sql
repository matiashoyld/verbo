/*
  Warnings:

  - You are about to drop the `Competency` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Competency" DROP CONSTRAINT "Competency_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "Criterion" DROP CONSTRAINT "Criterion_sub_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "QuestionCompetency" DROP CONSTRAINT "QuestionCompetency_competency_id_fkey";

-- DropTable
DROP TABLE "Competency";

-- CreateTable
CREATE TABLE "SubSkill" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SubSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubSkill_skill_id_name_key" ON "SubSkill"("skill_id", "name");

-- AddForeignKey
ALTER TABLE "SubSkill" ADD CONSTRAINT "SubSkill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criterion" ADD CONSTRAINT "Criterion_sub_skill_id_fkey" FOREIGN KEY ("sub_skill_id") REFERENCES "SubSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCompetency" ADD CONSTRAINT "QuestionCompetency_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "SubSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
