/*
  Warnings:

  - You are about to drop the column `expenseDate` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `paidBy` on the `Expense` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `joinDate` on the `GroupMember` table. All the data in the column will be lost.
  - You are about to drop the column `leaveDate` on the `GroupMember` table. All the data in the column will be lost.
  - Added the required column `amountInr` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidById` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `joinedAt` to the `GroupMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "expenseDate",
DROP COLUMN "paidBy",
ADD COLUMN     "amountInr" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isSettlement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paidById" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GroupMember" DROP COLUMN "joinDate",
DROP COLUMN "leaveDate",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "leftAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ExpenseSplit" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ExpenseSplit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRows" INTEGER NOT NULL,
    "imported" INTEGER NOT NULL,
    "skipped" INTEGER NOT NULL,
    "flagged" INTEGER NOT NULL,
    "anomalies" JSONB NOT NULL,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseSplit" ADD CONSTRAINT "ExpenseSplit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
