/*
  Warnings:

  - A unique constraint covering the columns `[shopping_cart_id,product_id]` on the table `shopping_cart_details` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shopping_cart_details_shopping_cart_id_product_id_key" ON "shopping_cart_details"("shopping_cart_id", "product_id");
