"use client";

import { useState } from "react";
import styles from "./ProductDetail.module.css";
import { Star, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
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

  if (!product) return null;

  const extraPrice = Object.values(selectedVariants).reduce((sum, opt) => sum + (opt.priceMod || 0), 0);
  const basePrice = (product.isPromo && product.promoPrice) ? product.promoPrice : product.price;
  const finalPrice = basePrice + extraPrice;
  const displayOriginal = product.originalPrice;

  const formatPrice = (price) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const handleVariantSelect = (groupName, option) => {
    setSelectedVariants(prev => ({ ...prev, [groupName]: option }));
  };

  const handleDirectBuy = () => {
    const variantsArray = Object.entries(selectedVariants).map(([groupName, option]) => ({ groupName, optionName: option.name, priceMod: option.priceMod }));
    
    let variantText = "";
    if (variantsArray && variantsArray.length > 0) {
      variantText = " (" + variantsArray.map(v => `${v.groupName}: ${v.optionName}`).join(", ") + ")";
    }

    let message = "Halo Dapur Arabella, saya mau pesan:\n\n";
    message += `- 1x ${product.name}${variantText} (@ ${formatPrice(finalPrice)})\n`;
    message += `\n*Total: ${formatPrice(finalPrice)}*\n\nMohon info untuk pembayaran dan pengiriman ya. Terima kasih!`;
    
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
          <img src={activeImage} alt={product.name} className={styles.image} />
          
          {product.images && product.images.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 0', overflowX: 'auto' }}>
              <img src={product.image} onClick={() => setActiveImage(product.image)} style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer', border: activeImage === product.image ? '2px solid var(--primary)' : '1px solid transparent', borderRadius: 'var(--radius-sm)' }} alt="Main" />
              {product.images.map((img, idx) => (
                <img key={idx} src={img} onClick={() => setActiveImage(img)} style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer', border: activeImage === img ? '2px solid var(--primary)' : '1px solid transparent', borderRadius: 'var(--radius-sm)' }} alt="Gallery" />
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.name}>
            <span style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', marginRight: '8px', verticalAlign: 'middle', fontWeight: 600 }}>Star</span>
            {product.name}
          </h1>

          <div className={styles.ratingRow}>
            <div className={styles.ratingStars}>
              <span>{product.rating}</span>
              <Star size={14} fill="var(--accent)" color="var(--accent)" />
              <Star size={14} fill="var(--accent)" color="var(--accent)" />
              <Star size={14} fill="var(--accent)" color="var(--accent)" />
              <Star size={14} fill="var(--accent)" color="var(--accent)" />
              <Star size={14} fill="var(--accent)" color="var(--accent)" />
            </div>
            <div className={styles.soldCount}>
              <span>{product.sold}</span> Penilaian
            </div>
            <div className={styles.soldCount}>
              <span>{product.sold * 3}</span> Terjual
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
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '100px', color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>{v.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                    {v.options.map((opt, oIdx) => (
                      <button 
                        key={oIdx} 
                        onClick={() => handleVariantSelect(v.name, opt)}
                        style={{ 
                          padding: '8px 16px', 
                          border: selectedVariants[v.name]?.name === opt.name ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                          color: selectedVariants[v.name]?.name === opt.name ? 'var(--primary)' : 'var(--foreground)',
                          background: selectedVariants[v.name]?.name === opt.name ? 'rgba(37, 99, 235, 0.05)' : '#fff',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: selectedVariants[v.name]?.name === opt.name ? 600 : 400,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {opt.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.actions} style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button onClick={handleAddToCart} style={{ flex: 1, padding: '12px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
              <ShoppingCart size={20} /> Masukkan Keranjang
            </button>
            {config?.waNumber && (
              <button onClick={handleDirectBuy} style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                Beli Sekarang
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>Spesifikasi Produk</div>
        <div style={{ display: 'flex', marginBottom: '15px', fontSize: '0.875rem' }}>
          <div style={{ width: '140px', color: 'rgba(0,0,0,.4)' }}>Kategori</div>
          <div><Link href="/#menu-section" style={{ color: '#05a' }}>Jajanan & Minuman</Link></div>
        </div>
        <div style={{ display: 'flex', marginBottom: '15px', fontSize: '0.875rem' }}>
          <div style={{ width: '140px', color: 'rgba(0,0,0,.4)' }}>Stok</div>
          <div>Selalu Fresh</div>
        </div>
        <div style={{ display: 'flex', marginBottom: '25px', fontSize: '0.875rem' }}>
          <div style={{ width: '140px', color: 'rgba(0,0,0,.4)' }}>Dikirim Dari</div>
          <div>KAB. JEMBER</div>
        </div>

        <div className={styles.sectionHeader}>Deskripsi Produk</div>
        <div className={styles.description} dangerouslySetInnerHTML={{ __html: product.description || '' }}></div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>Penilaian Produk</div>
        <ProductReviews product={product} reviews={product.reviews || []} />
      </div>
    </div>
  );
}
