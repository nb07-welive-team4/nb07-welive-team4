/*
  Warnings:

  - The values [COMPLETED] on the enum `ComplaintStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ComplaintStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');
ALTER TABLE "public"."Complaint" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Complaint" ALTER COLUMN "status" TYPE "ComplaintStatus_new" USING ("status"::text::"ComplaintStatus_new");
ALTER TYPE "ComplaintStatus" RENAME TO "ComplaintStatus_old";
ALTER TYPE "ComplaintStatus_new" RENAME TO "ComplaintStatus";
DROP TYPE "public"."ComplaintStatus_old";
ALTER TABLE "Complaint" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
