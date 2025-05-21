-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL,
    "feedbackLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
