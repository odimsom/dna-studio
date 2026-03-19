-- CreateTable
CREATE TABLE "UGCCharacter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "previewVideoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "previewPrompt" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UGCCharacter_pkey" PRIMARY KEY ("id")
);
