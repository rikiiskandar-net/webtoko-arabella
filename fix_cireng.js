const fs = require('fs');
const crypto = require("crypto");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function signHmac(data) {
  return crypto.createHmac("sha256", process.env.AUTH_SECRET).update(data).digest("hex");
}

function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 60*60*24 };
  const data = JSON.stringify(fullPayload);
  const base64 = Buffer.from(data).toString("base64");
  return `${base64}.${signHmac(base64)}`;
}

const token = signToken({ id: 1, username: 'admin', role: 'superadmin' });
const cookie = `auth_token=${token}`;

async function run() {
  try {
    const resData = await fetch("http://localhost:3000/api/products").then(r => r.json());
    const productsArray = Array.isArray(resData) ? resData : (resData.products || resData.data || []);
    const cireng = productsArray.find(p => p.name === "Cireng Ayam Suwir");

    if (!cireng) {
      console.log("Produk tidak ditemukan");
      return;
    }

    const imgPath = 'C:\\Users\\ARABELLA\\.gemini\\antigravity\\brain\\4a8ed545-1f77-4126-8e10-4a00e3b39f26\\cireng_ayam_suwir_1782622206547.png';
    const buffer = fs.readFileSync(imgPath);
    
    const filename = `${Date.now()}-cireng-ayam.png`;
    console.log("Mengunggah gambar ke Supabase:", filename);
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);
      
    console.log("Berhasil diunggah! URL:", publicUrl);

    console.log("Memperbarui produk ID:", cireng.id);
    const res = await fetch(`http://localhost:3000/api/products/${cireng.id}`, {
      method: "PUT",
      headers: { "Cookie": cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ image: publicUrl })
    });
    
    console.log(`Status update: ${res.status}`);
  } catch (err) {
    console.error("Fatal error:", err);
  }
}
run();
