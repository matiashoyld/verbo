-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "context" TEXT,
    "status" "PositionStatus" NOT NULL DEFAULT 'DRAFT',
    "openings" INTEGER NOT NULL DEFAULT 1,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "PositionQuestion" (
    "id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "context" TEXT,
    "skills_assessed" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PositionQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionSkill" ADD CONSTRAINT "PositionSkill_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionQuestion" ADD CONSTRAINT "PositionQuestion_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;
