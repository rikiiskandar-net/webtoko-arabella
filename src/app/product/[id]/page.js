import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductClientHeader from "./ProductClientHeader";
import ProductDetailClient from "./ProductDetailClient";
import Footer from "@/components/Footer";
import styles from "./ProductDetail.module.css";
import prisma from "@/lib/prisma";

export async function generateMetadata({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) }
  });

  if (!product) return { title: "Produk Tidak Ditemukan" };

  return {
    title: `${product.name} | Dapur Arabella`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Dapur Arabella`,
      description: product.description,
      images: [product.image],
    }
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) }
  });

  if (!product) {
    notFound();
  }

  const config = await prisma.storeConfig.findFirst();
  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const displayPrice = product.price;
  const displayOriginal = product.originalPrice;

  // WA Link Generation
  let msg = `Halo Dapur Arabella, saya mau pesan:\n\n- 1x ${product.name} (@ ${formatPrice(displayPrice)})\n\nTotal: ${formatPrice(displayPrice)}\n\nMohon info pembayaran dan pengiriman ya. Terima kasih!`;
  const waLink = config?.waNumber ? `https://wa.me/${config.waNumber}?text=${encodeURIComponent(msg)}` : "#";

  // JSON-LD Schema
  const baseUrl = 'https://www.arabella.web.id';
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${product.id}`,
      "priceCurrency": "IDR",
      "price": displayPrice,
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "5.0",
      "reviewCount": product.sold || "1"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClientHeader />
      <main className={styles.main}>
        <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Kembali ke Menu</Link>
        <ProductDetailClient product={product} config={config} />
      </main>
      <Footer config={config} />
    </>
  );
}
