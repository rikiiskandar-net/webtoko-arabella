const { Pool } = require('pg');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf-8');
const dbUrlMatch = env.match(/DATABASE_URL="?([^"\n]+)"?/);
if (!dbUrlMatch) throw new Error("No DATABASE_URL in .env");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = new Pool({
  connectionString: dbUrlMatch[1],
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const newDesc = "Dapur Arabella menyajikan aneka jajanan dan lauk rumahan 100% halal, higienis, dan bebas pengawet. Dari Cireng Salju hingga Es Mambo legendaris, kami menghadirkan kelezatan masakan ibu langsung ke meja makan Anda.";

  const res = await pool.query(
    `UPDATE "StoreConfig" SET description = $1 RETURNING id`,
    [newDesc]
  );
  
  if (res.rowCount > 0) {
    console.log("Config updated successfully!");
  } else {
    console.log("No config found, skipping DB update.");
  }
  process.exit(0);
}

run().catch(console.error);
