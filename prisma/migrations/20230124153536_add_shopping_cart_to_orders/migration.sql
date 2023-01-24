/*
  Warnings:

  - You are about to drop the column `user_id` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopping_cart_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopping_cart_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "user_id",
ADD COLUMN     "shopping_cart_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopping_cart_id_key" ON "orders"("shopping_cart_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shopping_cart_id_fkey" FOREIGN KEY ("shopping_cart_id") REFERENCES "shopping_carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
