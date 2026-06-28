"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, ShoppingCart, MessageCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./ProductDetail.module.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [config, setConfig] = useState({ waNumber: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then(r => r.json()).catch(() => ({ waNumber: "" })),
      fetch(`/api/store/products/${id}`).then(r => {
        if (!r.ok) throw new Error("Produk tidak ditemukan");
        return r.json();
      }),
    ]).then(([cfg, prod]) => {
      setConfig(cfg);
      setProduct(prod);
      setLoading(false);
    }).catch(() => {
      setError("Produk tidak ditemukan");
      setLoading(false);
    });
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const handleBuyWA = () => {
    if (!product || !config.waNumber) return;
    const buyPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
    let msg = `Halo Dapur Arabella, saya mau pesan:\n\n- 1x ${product.name} (@ ${formatPrice(buyPrice)})\n\nTotal: ${formatPrice(buyPrice)}\n\nMohon info pembayaran dan pengiriman ya. Terima kasih!`;
    window.open(`https://wa.me/${config.waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <>
        <Header searchQuery="" onSearchChange={() => {}} cartItemCount={0} />
        <main className={styles.main}>
          <div className={styles.loading}>Memuat...</div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header searchQuery="" onSearchChange={() => {}} cartItemCount={0} />
        <main className={styles.main}>
          <div className={styles.errorBox}>
            <AlertCircle size={48} />
            <h2>Produk tidak ditemukan</h2>
            <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Kembali ke Menu</Link>
          </div>
        </main>
      </>
    );
  }

  const displayPrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
  const displayOriginal = product.isPromo && product.promoPrice ? product.price : null;

  return (
    <>
      <Header searchQuery="" onSearchChange={() => {}} cartItemCount={0} />
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
              {config.waNumber && (
                <button className={styles.waBtn} onClick={handleBuyWA}>
                  <MessageCircle size={20} /> Pesan Lewat WhatsApp
                </button>
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
