-- CreateEnum
CREATE TYPE "ProductBadge" AS ENUM ('Promo', 'Bestseller', 'Baru');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('superadmin', 'admin');

-- AlterTable: Admin.role String → AdminRole
ALTER TABLE "Admin" ALTER COLUMN "role" SET DATA TYPE "AdminRole" USING "role"::"AdminRole";
ALTER TABLE "Admin" ALTER COLUMN "role" SET DEFAULT 'admin';

-- AlterTable: Order.status String → OrderStatus
ALTER TABLE "Order" ALTER COLUMN "status" SET DATA TYPE "OrderStatus" USING "status"::"OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable: Product.badge String? → ProductBadge?
ALTER TABLE "Product" ALTER COLUMN "badge" SET DATA TYPE "ProductBadge" USING
  CASE
    WHEN "badge" = '' OR "badge" IS NULL THEN NULL
    ELSE "badge"::"ProductBadge"
  END;
