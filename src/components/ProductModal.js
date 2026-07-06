import { useState, useEffect } from "react";
import styles from "./ProductModal.module.css";

export default function ProductModal({ product, onClose, cartQuantity, onUpdateQuantity, onBuyNow }) {
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      const initialVars = {};
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach(v => {
          if (v.options && v.options.length > 0) {
            initialVars[v.name] = v.options[0]; // Auto-select first option
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
  
  const originalPrice = product.originalPrice; // For strikethrough

  const formatPrice = (price) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const handleVariantSelect = (groupName, option) => {
    setSelectedVariants(prev => ({ ...prev, [groupName]: option }));
  };

  const handleAddToCart = () => {
    const variantsArray = Object.entries(selectedVariants).map(([groupName, option]) => ({ groupName, optionName: option.name, priceMod: option.priceMod }));
    onUpdateQuantity(product.id, 1, product.name, variantsArray);
    onClose();
  };

  const handleDirectBuy = () => {
    const variantsArray = Object.entries(selectedVariants).map(([groupName, option]) => ({ groupName, optionName: option.name, priceMod: option.priceMod }));
    onBuyNow(product.id, variantsArray);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.dragHandle} onClick={onClose} title="Tutup"></div>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <div className={styles.imageContainer}>
          <img src={activeImage} alt={product.name} className={styles.image} onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23E2E8F0%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394A3B8%22%20font-size%3D%2216%22%20dy%3D%22.1em%22%3EGambar%20tidak%20tersedia%3C%2Ftext%3E%3C%2Fsvg%3E'; }} />
          
          {product.images && product.images.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', background: '#F8FAFC' }}>
              <img src={product.image} onClick={() => setActiveImage(product.image)} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === product.image ? '2px solid var(--primary)' : '1px solid #CBD5E1' }} alt="Main" />
              {product.images.map((img, idx) => (
                <img key={idx} src={img} onClick={() => setActiveImage(img)} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: activeImage === img ? '2px solid var(--primary)' : '1px solid #CBD5E1' }} alt="Gallery" />
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.content}>
          <h2 className={styles.name}>{product.name}</h2>
          <p className={styles.price}>
            {originalPrice && (
              <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontWeight: 500, fontSize: '0.9rem', marginRight: '0.5rem' }}>
                {formatPrice(originalPrice)}
              </span>
            )}
            {formatPrice(finalPrice)}
          </p>
          
          <div className={styles.divider}></div>
          
          <h4 className={styles.sectionTitle}>Deskripsi Produk</h4>
          <div className={styles.description} dangerouslySetInnerHTML={{ __html: product.description || '' }}></div>
          
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              {product.variants.map((v, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>{v.name}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {v.options.map((opt, oIdx) => (
                      <label key={oIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: selectedVariants[v.name]?.name === opt.name ? '1px solid var(--primary)' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', background: selectedVariants[v.name]?.name === opt.name ? '#F0F9FF' : '#FFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input type="radio" name={`variant-${v.name}`} checked={selectedVariants[v.name]?.name === opt.name} onChange={() => handleVariantSelect(v.name, opt)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>{opt.name}</span>
                        </div>
                        {opt.priceMod > 0 && <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>+{formatPrice(opt.priceMod)}</span>}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.infoBox}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>Stok selalu fresh setiap hari</span>
          </div>
          
          <div className={styles.actions}>
             <button className={styles.buyNowBtn} onClick={handleDirectBuy}>
                Pesan Langsung
             </button>
             <button className={styles.cartBtn} onClick={handleAddToCart}>
                + Keranjang
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
