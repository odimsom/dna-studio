-- CreateTable
CREATE TABLE "Photoshoot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productImage" TEXT,
    "productDescription" TEXT,
    "templates" TEXT[],
    "results" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photoshoot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photoshoot" ADD CONSTRAINT "Photoshoot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
