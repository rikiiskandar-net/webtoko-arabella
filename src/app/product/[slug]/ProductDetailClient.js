"use client";

import { useState } from "react";
import styles from "./ProductDetail.module.css";
import { Star, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductReviews from "@/components/ProductReviews";

export default function ProductDetailClient({ product, config }) {
  const getInitialVariants = () => {
    const initialVars = {};
    if (product && product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(v => {
        if (v.options && v.options.length > 0) {
          initialVars[v.name] = v.options[0];
        }
      });
    }
    return initialVars;
  };

  const [selectedVariants, setSelectedVariants] = useState(getInitialVariants);
  const [activeImage, setActiveImage] = useState(product?.image || "");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!product) return null;

  const extraPrice = Object.values(selectedVariants).reduce((sum, opt) => sum + (opt.priceMod || 0), 0);
  const basePrice = (product.isPromo && product.promoPrice) ? product.promoPrice : product.price;
  const finalPrice = basePrice + extraPrice;
  const displayOriginal = product.originalPrice;

  const formatPrice = (price) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const handleVariantSelect = (groupName, option) => {
    setSelectedVariants(prev => ({ ...prev, [groupName]: option }));
  };

  const handleDirectBuy = async () => {
    setIsCheckingOut(true);
    let orderId = null;
    const variantsArray = Object.entries(selectedVariants).map(([groupName, option]) => ({ groupName, optionName: option.name, priceMod: option.priceMod }));
    
    try {
      // Create order via API first
      const payload = {
        items: [{
          id: product.id,
          qty: 1,
          variants: variantsArray
        }]
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        orderId = data.orderId;
      } else {
        console.error("Gagal menyimpan pesanan langsung ke database");
      }
    } catch (err) {
      console.error("Error saving direct order:", err);
    } finally {
      setIsCheckingOut(false);
    }

    let variantText = "";
    if (variantsArray && variantsArray.length > 0) {
      variantText = " (" + variantsArray.map(v => `${v.groupName}: ${v.optionName}`).join(", ") + ")";
    }

    let message = "Halo Dapur Arabella, saya mau pesan:\n\n";
    message += `- 1x ${product.name}${variantText} (@ ${formatPrice(finalPrice)})\n`;
    message += `\n*Total: ${formatPrice(finalPrice)}*\n`;
    
    if (orderId) {
      message += `\nRef: #${orderId.split('-')[0].toUpperCase()}\n`;
    }
    
    message += `\nMohon info untuk pembayaran dan pengiriman ya. Terima kasih!`;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = config?.waNumber || "6281234567890";
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleAddToCart = async () => {
    const variantsArray = Object.entries(selectedVariants).map(([groupName, option]) => ({ groupName, optionName: option.name, priceMod: option.priceMod }));
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1, variants: variantsArray }),
      });
      
      if (res.status === 401) {
        window.location.href = "/masuk";
        return;
      }

      if (res.ok) {
        alert(`${product.name} ditambahkan ke keranjang`);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error("Gagal menambah keranjang", error);
    }
  };

  return (
    <div className={styles.productContainer}>
      <div className={styles.card}>
        <div className={styles.imageSection}>
          {product.badge && (
            <div className={styles.badge}>{product.badge}</div>
          )}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
            <Image src={activeImage || "/images/placeholder.png"} alt={product.name} fill style={{ objectFit: 'cover', borderRadius: 'var(--radius-md)' }} sizes="(max-width: 768px) 100vw, 450px" priority />
          </div>
          
          {product.images && product.images.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 0', overflowX: 'auto' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, cursor: 'pointer', border: activeImage === product.image ? '2px solid var(--primary)' : '1px solid transparent', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }} onClick={() => setActiveImage(product.image)}>
                <Image src={product.image} alt="Main" fill style={{ objectFit: 'cover' }} sizes="80px" />
              </div>
              {product.images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, cursor: 'pointer', border: activeImage === img ? '2px solid var(--primary)' : '1px solid transparent', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }} onClick={() => setActiveImage(img)}>
                  <Image src={img} alt="Gallery" fill style={{ objectFit: 'cover' }} sizes="80px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.name}>
            {product.name}
          </h1>

          <div className={styles.ratingRow}>
            <div className={styles.ratingStars}>
              <span>{product.rating > 0 ? product.rating : (product.reviews?.length > 0 ? (product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / product.reviews.length).toFixed(1) : "0")}</span>
              <Star size={14} fill="var(--accent)" color="var(--accent)" />
            </div>
            <div className={styles.soldCount}>
              <span>{product.reviews?.length || 0}</span> Penilaian
            </div>
            <div className={styles.soldCount}>
              <span>{product.sold || "0"}</span> Terjual
            </div>
          </div>

          <div className={styles.priceRow}>
            {displayOriginal && (
              <span className={styles.originalPrice}>{formatPrice(displayOriginal)}</span>
            )}
            <span className={styles.price}>{formatPrice(finalPrice)}</span>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '3px 6px', fontSize: '0.7rem', fontWeight: 600, borderRadius: 'var(--radius-sm)', marginLeft: '10px' }}>DISKON</div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              {product.variants.map((v, idx) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <div style={{ color: 'var(--foreground)', fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Pilih {v.name}:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {v.options.map((opt, oIdx) => (
                      <button 
                        key={oIdx} 
                        onClick={() => handleVariantSelect(v.name, opt)}
                        style={{ 
                          padding: '10px 20px', 
                          border: selectedVariants[v.name]?.name === opt.name ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                          color: selectedVariants[v.name]?.name === opt.name ? 'var(--primary)' : '#475569',
                          background: selectedVariants[v.name]?.name === opt.name ? 'rgba(37, 99, 235, 0.05)' : '#F8FAFC',
                          borderRadius: '50px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: selectedVariants[v.name]?.name === opt.name ? 700 : 500,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span>{opt.name}</span>
                        {opt.priceMod > 0 && <span style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>+{formatPrice(opt.priceMod)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '24px', marginBottom: '24px', padding: '16px', background: '#FFF7ED', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#9A3412', marginBottom: '8px' }}>Deskripsi Kelezatan</h3>
            <div className={styles.descriptionText} dangerouslySetInnerHTML={{ __html: product.description || '' }} style={{ color: '#431407', fontSize: '0.95rem', lineHeight: '1.6' }}></div>
          </div>

          <div className={styles.stickyActions}>
            <button onClick={handleAddToCart} className={styles.cartBtn}>
              <ShoppingCart size={20} /> Masukkan Keranjang
            </button>
            {config?.waNumber && (
              <button onClick={handleDirectBuy} className={styles.buyBtn}>
                Beli Sekarang
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>Penilaian Produk</div>
        <ProductReviews product={product} reviews={product.reviews || []} />
      </div>
    </div>
  );
}
