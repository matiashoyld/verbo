-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RECRUITER', 'CANDIDATE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'RECRUITER',
    "image_url" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "num_id" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "num_id" INTEGER,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "num_id" INTEGER,
    "level_1_inadequate" TEXT,
    "level_2_needs_guidance" TEXT,
    "level_3_competent" TEXT,
    "level_4_proficient" TEXT,
    "level_5_exceptional" TEXT,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criterion" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "competency_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "time_limit" INTEGER,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" UUID NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "position_id" UUID NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommonPosition" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CommonPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "context" TEXT,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionQuestion" (
    "id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "context" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PositionQuestion_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "RecordingMetadata" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "durationSeconds" INTEGER,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "submission_question_id" UUID NOT NULL,
    "positionId" UUID NOT NULL,

    CONSTRAINT "RecordingMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionQuestion" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "position_question_id" UUID NOT NULL,
    "overall_assessment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "skills_demonstrated" TEXT[],
    "strengths" TEXT[],
    "areas_of_improvement" TEXT[],

    CONSTRAINT "SubmissionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionQuestionCompetency" (
    "id" UUID NOT NULL,
    "submission_question_id" UUID NOT NULL,
    "question_competency_id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "rationale" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SubmissionQuestionCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChallengeToSkill" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ChallengeToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_num_id_key" ON "Category"("num_id");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_num_id_key" ON "Skill"("num_id");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_category_id_name_key" ON "Skill"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_num_id_key" ON "Competency"("num_id");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_skill_id_name_key" ON "Competency"("skill_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CommonPosition_title_key" ON "CommonPosition"("title");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionCompetency_question_id_competency_id_key" ON "QuestionCompetency"("question_id", "competency_id");

-- CreateIndex
CREATE UNIQUE INDEX "RecordingMetadata_submission_question_id_key" ON "RecordingMetadata"("submission_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionQuestion_submission_id_position_question_id_key" ON "SubmissionQuestion"("submission_id", "position_question_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionQuestionCompetency_submission_question_id_questio_key" ON "SubmissionQuestionCompetency"("submission_question_id", "question_competency_id");

-- CreateIndex
CREATE INDEX "_ChallengeToSkill_B_index" ON "_ChallengeToSkill"("B");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criterion" ADD CONSTRAINT "Criterion_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionQuestion" ADD CONSTRAINT "PositionQuestion_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCompetency" ADD CONSTRAINT "QuestionCompetency_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCompetency" ADD CONSTRAINT "QuestionCompetency_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "PositionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordingMetadata" ADD CONSTRAINT "RecordingMetadata_submission_question_id_fkey" FOREIGN KEY ("submission_question_id") REFERENCES "SubmissionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionQuestion" ADD CONSTRAINT "SubmissionQuestion_position_question_id_fkey" FOREIGN KEY ("position_question_id") REFERENCES "PositionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionQuestion" ADD CONSTRAINT "SubmissionQuestion_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionQuestionCompetency" ADD CONSTRAINT "SubmissionQuestionCompetency_submission_question_id_fkey" FOREIGN KEY ("submission_question_id") REFERENCES "SubmissionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionQuestionCompetency" ADD CONSTRAINT "SubmissionQuestionCompetency_question_competency_id_fkey" FOREIGN KEY ("question_competency_id") REFERENCES "QuestionCompetency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToSkill" ADD CONSTRAINT "_ChallengeToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToSkill" ADD CONSTRAINT "_ChallengeToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
