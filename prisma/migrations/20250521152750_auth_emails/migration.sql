/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Authentication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Authentication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Authentication" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_email_key" ON "Authentication"("email");
