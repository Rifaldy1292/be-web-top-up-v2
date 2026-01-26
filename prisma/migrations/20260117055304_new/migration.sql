/*
  Warnings:

  - Added the required column `category` to the `list_games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `list_games` ADD COLUMN `category` VARCHAR(191) NOT NULL;
