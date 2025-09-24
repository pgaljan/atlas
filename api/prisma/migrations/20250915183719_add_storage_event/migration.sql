-- CreateTable
CREATE TABLE "public"."StorageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bytes" BIGINT NOT NULL,
    "sign" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StorageEvent_userId_idx" ON "public"."StorageEvent"("userId");

-- CreateIndex
CREATE INDEX "StorageEvent_createdAt_idx" ON "public"."StorageEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."StorageEvent" ADD CONSTRAINT "StorageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
