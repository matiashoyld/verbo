-- CreateTable
CREATE TABLE "VideoAnalysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "overall_assessment" TEXT NOT NULL,
    "strengths" TEXT[] NOT NULL,
    "areas_for_improvement" TEXT[] NOT NULL,
    "skills_demonstrated" TEXT[] NOT NULL,

    CONSTRAINT "VideoAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoAnalysis_candidateId_positionId_questionId_key" ON "VideoAnalysis"("candidateId", "positionId", "questionId"); 