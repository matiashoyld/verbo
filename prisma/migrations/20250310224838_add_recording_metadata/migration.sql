-- CreateTable
CREATE TABLE "RecordingMetadata" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER,
    "durationSeconds" DOUBLE PRECISION,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RecordingMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecordingMetadata_candidateId_positionId_idx" ON "RecordingMetadata"("candidateId", "positionId");

-- CreateIndex
CREATE INDEX "RecordingMetadata_questionId_idx" ON "RecordingMetadata"("questionId");
