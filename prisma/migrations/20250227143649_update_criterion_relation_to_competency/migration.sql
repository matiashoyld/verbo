/*
  Warnings:

  - You are about to rename the column `sub_skill_id` on the `Criterion` table to `competency_id`. 

*/
-- DropForeignKey
ALTER TABLE "Criterion" DROP CONSTRAINT "Criterion_sub_skill_id_fkey";

-- Rename the column instead of dropping and adding
ALTER TABLE "Criterion" RENAME COLUMN "sub_skill_id" TO "competency_id";

-- AddForeignKey
ALTER TABLE "Criterion" ADD CONSTRAINT "Criterion_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
