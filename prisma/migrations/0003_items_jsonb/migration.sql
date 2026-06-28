-- AlterTable: Convert Order.items from String to JSONB
-- First, convert existing string data to JSONB
ALTER TABLE "Order" ALTER COLUMN "items" SET DATA TYPE JSONB USING 
  CASE 
    WHEN "items" = '' THEN '[]'::jsonb
    ELSE "items"::jsonb
  END;

-- Set default for new rows
ALTER TABLE "Order" ALTER COLUMN "items" SET DEFAULT '[]'::jsonb;
