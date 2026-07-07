import prisma from "@/lib/prisma";
import StorefrontClient from "@/components/StorefrontClient";

// Pastikan halaman ini dinamis (tidak di-cache secara statis oleh Next.js)
// agar setiap penambahan produk di admin langsung muncul.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true } 
  });
  
  const categories = await prisma.category.findMany({ 
    orderBy: { name: 'asc' }
  });

  const storeConfig = await prisma.storeConfig.findFirst();

  const banners = await prisma.heroBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Apakah Dapur Arabella melayani COD?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ya! Dapur Arabella melayani COD (Cash On Delivery) untuk area Jember. Anda bisa bayar langsung saat pesanan sampai di rumah."
        }
      },
      {
        "@type": "Question",
        "name": "Apakah produk Dapur Arabella halal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Semua produk Dapur Arabella 100% halal dan higienis. Kami menggunakan bahan-bahan pilihan tanpa bahan pengawet berbahaya."
        }
      },
      {
        "@type": "Question",
        "name": "Berapa harga cireng di Dapur Arabella?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cireng Ayam Suwir Pedas Manis mulai dari Rp 1.000 per pcs. Tersedia juga paket hemat isi 10 seharga Rp 10.000. Beli lewat website dapat potongan Rp 1.000 per Rp 10.000!"
        }
      },
      {
        "@type": "Question",
        "name": "Apakah ada minimum order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tidak ada minimum order! Anda bisa pesan satuan atau paket hemat. Kami juga menyediakan free ongkir untuk pengantaran langsung di area tertentu."
        }
      },
      {
        "@type": "Question",
        "name": "Bagaimana cara pesan di Dapur Arabella?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Anda bisa pesan langsung melalui website www.arabella.web.id, pilih produk, masukkan ke keranjang, dan checkout. Bisa juga pesan via WhatsApp."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <StorefrontClient 
        initialProducts={products} 
        initialCategories={categories} 
        storeConfig={storeConfig}
        initialBanners={banners}
      />
    </>
  );
}
