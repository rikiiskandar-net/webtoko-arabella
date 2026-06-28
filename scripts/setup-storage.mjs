import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function setupStorage() {
  console.log("[Storage] Setup bucket...");

  // Coba via SQL langsung ke storage schema
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, avif_autodetection)
      VALUES ('product-images', 'product-images', true, false)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("[Storage] Bucket 'product-images' siap (via SQL)");
  } catch (err) {
    console.log("[Storage] SQL fallback, coba lewat API...");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error } = await supabase.storage.createBucket('product-images', {
      public: true,
    });

    if (error && !error.message.includes('already exists')) {
      console.error("[Storage] Gagal buat bucket:", error.message);
      process.exit(1);
    }
    console.log("[Storage] Bucket 'product-images' siap (via API)");
  }

  // Allow public upload
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.policies (name, definition, bucket_id, action, owner)
      VALUES (
        'public-insert',
        '(bucket_id = ''product-images''::text)',
        'product-images',
        'INSERT',
        ''
      )
      ON CONFLICT DO NOTHING;
    `);
  } catch {}

  await prisma.$disconnect();
  console.log("[Storage] Selesai");
}

setupStorage();
