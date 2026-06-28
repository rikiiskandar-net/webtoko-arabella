import styles from "./ProductModal.module.css";

export default function ProductModal({ product, onClose, cartQuantity, onUpdateQuantity, onBuyNow }) {
  if (!product) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.dragHandle} onClick={onClose} title="Tutup"></div>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <div className={styles.imageContainer}>
          <img src={product.image} alt={product.name} className={styles.image} onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23E2E8F0%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394A3B8%22%20font-size%3D%2216%22%20dy%3D%22.1em%22%3EGambar%20tidak%20tersedia%3C%2Ftext%3E%3C%2Fsvg%3E'; }} />
        </div>
        
        <div className={styles.content}>
          <h2 className={styles.name}>{product.name}</h2>
          {product.isPromo && product.promoPrice ? (
            <p className={styles.price}>
              <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontWeight: 500, fontSize: '0.9rem', marginRight: '0.5rem' }}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)}
              </span>
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.promoPrice)}
            </p>
          ) : (
            <p className={styles.price}>
              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)}
            </p>
          )}
          
          <div className={styles.divider}></div>
          
          <h4 className={styles.sectionTitle}>Deskripsi Produk</h4>
          <p className={styles.description}>{product.description}</p>
          
          <div className={styles.infoBox}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>Stok selalu fresh setiap hari</span>
          </div>
          
          <div className={styles.actions}>
            {cartQuantity === 0 ? (
              <>
                <button className={styles.buyNowBtn} onClick={() => { onBuyNow(product.id); onClose(); }}>
                  Pesan Langsung
                </button>
                <button className={styles.cartBtn} onClick={() => { onUpdateQuantity(product.id, 1, product.name); onClose(); }}>
                  + Keranjang
                </button>
              </>
            ) : (
              <div className={styles.quantityControl}>
                <button className={styles.qtyBtn} onClick={() => onUpdateQuantity(product.id, -1, product.name)}>-</button>
                <span className={styles.qtyLabel}>{cartQuantity} di keranjang</span>
                <button className={styles.qtyBtn} onClick={() => onUpdateQuantity(product.id, 1, product.name)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
