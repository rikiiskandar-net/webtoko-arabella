-- AddIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- AddIndex
CREATE INDEX "HeroBanner_isActive_sortOrder_idx" ON "HeroBanner"("isActive", "sortOrder");

-- AddIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- AddIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- AddIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- AddIndex
CREATE INDEX "Product_isPromo_idx" ON "Product"("isPromo");

-- AddIndex
CREATE INDEX "Product_badge_idx" ON "Product"("badge");
