"use client";

import { useState, useEffect } from "react";
import styles from "./ProductDetail.module.css";
import { Star, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import ProductReviews from "@/components/ProductReviews";

export default function ProductDetailClient({ product, config }) {
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      const initialVars = {};
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(v => {
          if (v.options && v.options.length > 0) {
            initialVars[v.name] = v.options[0];
          }
        });
      }
      setSelectedVariants(initialVars);
    }
  }, [product]);

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
    <div className={styles.card}>
      <div className={styles.imageSection}>
        {product.badge && (
          <div className={styles.badge}>{product.badge}</div>
        )}
        <img src={activeImage} alt={product.name} className={styles.image} />
        
        {product.images && product.images.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', padding: '12px 0', overflowX: 'auto' }}>
            <img src={product.image} onClick={() => setActiveImage(product.image)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: activeImage === product.image ? '2px solid var(--primary)' : '1px solid #CBD5E1' }} alt="Main" />
            {product.images.map((img, idx) => (
              <img key={idx} src={img} onClick={() => setActiveImage(img)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: activeImage === img ? '2px solid var(--primary)' : '1px solid #CBD5E1' }} alt="Gallery" />
            ))}
          </div>
        )}
      </div>

      <div className={styles.infoSection}>
        <h1 className={styles.name}>{product.name}</h1>

        <div className={styles.ratingRow}>
          <Star size={16} fill="var(--accent)" color="var(--accent)" />
          <span>{product.rating}</span>
          <span className={styles.dot}>·</span>
          <span>Terjual {product.sold}</span>
        </div>

        <div className={styles.priceRow}>
          {displayOriginal && (
            <span className={styles.originalPrice}>{formatPrice(displayOriginal)}</span>
          )}
          <span className={styles.price}>{formatPrice(finalPrice)}</span>
        </div>
        
        <div style={{ display: 'inline-block', backgroundColor: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px', border: '1px solid #10b981' }}>
          ✨ Stok selalu fresh setiap hari
        </div>

        <div className={styles.description} dangerouslySetInnerHTML={{ __html: product.description || '' }}></div>

        {product.variants && product.variants.length > 0 && (
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            {product.variants.map((v, idx) => (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '12px' }}>{v.name}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {v.options.map((opt, oIdx) => (
                    <label key={oIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', border: selectedVariants[v.name]?.name === opt.name ? '2px solid var(--primary)' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: selectedVariants[v.name]?.name === opt.name ? '#F0F9FF' : '#FFF', minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="radio" name={`variant-${v.name}`} checked={selectedVariants[v.name]?.name === opt.name} onChange={() => handleVariantSelect(v.name, opt)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#334155' }}>{opt.name}</span>
                      </div>
                      {opt.priceMod > 0 && <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600, marginLeft: '12px' }}>+{formatPrice(opt.priceMod)}</span>}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {config?.waNumber && (
            <button onClick={handleDirectBuy} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}>
              <MessageCircle size={20} /> Pesan Sekarang
            </button>
          )}
          <button onClick={handleAddToCart} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: 'white', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f0f9ff'} onMouseOut={e => e.currentTarget.style.background = 'white'}>
            <ShoppingCart size={20} /> + Keranjang
          </button>
        </div>
        
        <ProductReviews product={product} reviews={product.reviews || []} />
      </div>
    </div>
  );
}
