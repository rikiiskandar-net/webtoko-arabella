const { Pool } = require('pg');
const fs = require('fs');

// Load .env
const env = fs.readFileSync('.env', 'utf-8');
const dbUrlMatch = env.match(/DATABASE_URL="?([^"\n]+)"?/);
if (!dbUrlMatch) throw new Error("No DATABASE_URL in .env");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({
  connectionString: dbUrlMatch[1],
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const badge = '🔥 EKSKLUSIF ORDER VIA WEB';
  const title = 'Belanja Makin Banyak, Makin Untung!';
  const subtitle = 'Potongan Langsung Rp 1.000 berlaku kelipatan tiap belanja Rp 10.000. Tanpa batas maksimal! Siapkan stok camilan di kulkas Anda sekarang.';
  const ctaText = 'Ambil Diskonnya Sekarang 👇';

  const res = await pool.query(
    `UPDATE "HeroBanner" 
     SET badge = $1, title = $2, subtitle = $3, "ctaText" = $4 
     WHERE id = (
       SELECT id FROM "HeroBanner" WHERE "isActive" = true ORDER BY "sortOrder" ASC LIMIT 1
     ) RETURNING id`,
    [badge, title, subtitle, ctaText]
  );
  
  if (res.rowCount > 0) {
    console.log("Banner updated successfully! ID:", res.rows[0].id);
  } else {
    console.log("No active banners found.");
  }
  process.exit(0);
}

run().catch(console.error);
