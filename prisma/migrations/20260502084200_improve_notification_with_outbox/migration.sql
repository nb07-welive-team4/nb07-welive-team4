/*
  Warnings:

  - A unique constraint covering the columns `[userId,dedupeKey]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationSourceType" AS ENUM ('COMPLAINT', 'NOTICE', 'POLL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_residentId_fkey";

-- DropIndex
DROP INDEX "Notification_dedupeKey_key";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "checkedAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deliveryStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failedReason" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceType" "NotificationSourceType",
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT,
    "userId" TEXT NOT NULL,
    "notificationType" "NotificationType" NOT NULL,
    "sourceType" "NotificationSourceType",
    "sourceId" TEXT,
    "dedupeKey" TEXT,
    "payload" JSONB NOT NULL,
    "status" "NotificationOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationOutbox_status_availableAt_idx" ON "NotificationOutbox"("status", "availableAt");

-- CreateIndex
CREATE INDEX "NotificationOutbox_notificationId_idx" ON "NotificationOutbox"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationOutbox_userId_createdAt_idx" ON "NotificationOutbox"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationOutbox_sourceType_sourceId_idx" ON "NotificationOutbox"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationOutbox_userId_dedupeKey_key" ON "NotificationOutbox"("userId", "dedupeKey");

-- CreateIndex
CREATE INDEX "Notification_userId_notifiedAt_idx" ON "Notification"("userId", "notifiedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_isChecked_notifiedAt_idx" ON "Notification"("userId", "isChecked", "notifiedAt");

-- CreateIndex
CREATE INDEX "Notification_notificationType_notifiedAt_idx" ON "Notification"("notificationType", "notifiedAt");

-- CreateIndex
CREATE INDEX "Notification_sourceType_sourceId_idx" ON "Notification"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "Notification_deliveryStatus_notifiedAt_idx" ON "Notification"("deliveryStatus", "notifiedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key" ON "Notification"("userId", "dedupeKey");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationOutbox" ADD CONSTRAINT "NotificationOutbox_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("notificationId") ON DELETE SET NULL ON UPDATE CASCADE;
