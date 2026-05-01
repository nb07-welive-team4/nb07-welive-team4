-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'COMPLAINT_CREATED';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_residentId_fkey";

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "commentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dong" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ho" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
