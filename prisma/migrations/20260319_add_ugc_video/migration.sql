-- CreateTable
CREATE TABLE "UGCVideo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productImage" TEXT,
    "productDescription" TEXT,
    "avatarId" TEXT NOT NULL,
    "avatarName" TEXT,
    "avatarThumbnail" TEXT,
    "script" TEXT NOT NULL,
    "scriptSource" TEXT NOT NULL DEFAULT 'ai',
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "providerVideoId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'heygen',
    "aspectRatio" TEXT NOT NULL DEFAULT '9:16',
    "status" TEXT NOT NULL DEFAULT 'generating',
    "duration" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UGCVideo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UGCVideo" ADD CONSTRAINT "UGCVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
