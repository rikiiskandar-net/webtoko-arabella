import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, ShoppingCart, MessageCircle } from "lucide-react";
import ProductClientHeader from "./ProductClientHeader";
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

  const displayPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
  const displayOriginal = product.isPromo && product.promoPrice ? product.price : null;

  // WA Link Generation
  let msg = `Halo Dapur Arabella, saya mau pesan:\n\n- 1x ${product.name} (@ ${formatPrice(displayPrice)})\n\nTotal: ${formatPrice(displayPrice)}\n\nMohon info pembayaran dan pengiriman ya. Terima kasih!`;
  const waLink = config?.waNumber ? `https://wa.me/${config.waNumber}?text=${encodeURIComponent(msg)}` : "#";

  // JSON-LD Schema
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
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

        <div className={styles.card}>
          <div className={styles.imageSection}>
            {product.badge && (
              <div className={styles.badge}>{product.badge}</div>
            )}
            <img src={product.image} alt={product.name} className={styles.image} />
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.ratingRow}>
              <Star size={16} fill="var(--accent)" color="var(--accent)" />
              <span>{product.rating}</span>
              <span className={styles.dot}>·</span>
              <span>Terjual {product.sold}</span>
            </div>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.priceRow}>
              {displayOriginal && (
                <span className={styles.originalPrice}>{formatPrice(displayOriginal)}</span>
              )}
              <span className={styles.price}>{formatPrice(displayPrice)}</span>
            </div>

            <div className={styles.actions}>
              {config?.waNumber && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className={styles.waBtn}>
                  <MessageCircle size={20} /> Pesan Lewat WhatsApp
                </a>
              )}
              <Link href="/#menu-section" className={styles.orderLink}>
                <ShoppingCart size={20} /> Lihat Menu Lainnya
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}
