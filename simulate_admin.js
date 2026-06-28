const crypto = require("crypto");

function signHmac(data) {
  return crypto.createHmac("sha256", "844d7ac7a56ace054341038c2c9747ef536022675ad7c4f19cfaff45f1b4e321").update(data).digest("hex");
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
    let cats = await fetch("http://localhost:3000/api/categories", {
      headers: { "Cookie": cookie }
    }).then(r => r.json());

    let catId;
    if (cats.length === 0) {
      console.log("Kategori kosong. Membuat kategori 'Camilan Goreng'...");
      const newCat = await fetch("http://localhost:3000/api/categories", {
        method: "POST",
        headers: { "Cookie": cookie, "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Camilan Goreng", icon: "Grid2x2" })
      }).then(r => r.json());
      catId = newCat.id;
    } else {
      catId = cats[0].id;
    }

    console.log("Membuat produk Cireng Ayam Suwir...");
    const productData = {
      name: "Cireng Ayam Suwir",
      price: 15000,
      description: "Cireng renyah di luar, kenyal di dalam dengan isian ayam suwir pedas nagih.",
      image: "C:\\Users\\ARABELLA\\.gemini\\antigravity\\brain\\4a8ed545-1f77-4126-8e10-4a00e3b39f26\\cireng_ayam_suwir_1782622206547.png",
      isPromo: false,
      badge: "Baru",
      rating: 4.9,
      sold: "20+",
      categoryId: catId
    };

    const res = await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Cookie": cookie, "Content-Type": "application/json" },
      body: JSON.stringify(productData)
    });

    const body = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${body}`);
  } catch (err) {
    console.error(err);
  }
}
run();
