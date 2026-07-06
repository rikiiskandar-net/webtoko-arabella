import styles from "./ProductCard.module.css";
import { Star } from "lucide-react";

export default function ProductCard({ product, cartQuantity, onUpdateQuantity, onBuyNow, onViewDetail, isSmall = false }) {
  const displayPrice = product.price;
  const displayOriginal = product.originalPrice;
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  };

  return (
    <div className={`${styles.card} ${isSmall ? styles.cardSmall : ''}`}>
      <div className={`${styles.imageContainer} ${isSmall ? styles.imageContainerSmall : ''} ${styles.skeletonBg}`} onClick={() => onViewDetail && onViewDetail(product)} style={{cursor: 'pointer'}}>
        {product.badge && (
          <div className={`${styles.badge} ${isSmall ? styles.badgeSmall : ''}`} style={{ backgroundColor: product.badgeColor || 'var(--primary)' }}>
            {product.badge}
          </div>
        )}
        {/* Placeholder grey background acts as a skeleton before image loads */}
        <img src={product.image} alt={product.name} className={styles.image} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23E2E8F0%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20fill%3D%22%2394A3B8%22%20font-size%3D%2216%22%20dy%3D%22.1em%22%3EGambar%20tidak%20tersedia%3C%2Ftext%3E%3C%2Fsvg%3E'; }} />
      </div>
      <div className={`${styles.content} ${isSmall ? styles.contentSmall : ''}`}>
        <h3 className={`${styles.name} ${isSmall ? styles.nameSmall : ''}`} onClick={() => onViewDetail && onViewDetail(product)} style={{cursor: 'pointer'}}>{product.name}</h3>
        
        {/* Social Proof: Rating & Terjual */}
        <div className={`${styles.metaContainer} ${isSmall ? styles.metaContainerSmall : ''}`}>
          <div className={styles.rating}>
            <span className={styles.ratingStar}>
              <Star size={14} strokeWidth={2} color="var(--accent)" fill="var(--accent)" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '2px' }} />
            </span> {product.rating || '4.8'}
          </div>
          <span className={styles.divider}>|</span>
          <span className={styles.soldCount}>Terjual {product.sold || '1k+'}</span>
        </div>

        <p className={`${styles.description} ${isSmall ? styles.descriptionSmall : ''}`}>{stripHtml(product.description)}</p>
        
        <div className={`${styles.priceContainer} ${isSmall ? styles.priceContainerSmall : ''}`}>
          {displayOriginal && (
            <span className={`${styles.originalPrice} ${isSmall ? styles.originalPriceSmall : ''}`}>{formatPrice(displayOriginal)}</span>
          )}
          <span className={`${styles.price} ${isSmall ? styles.priceSmall : ''}`}>{formatPrice(displayPrice)}</span>
        </div>
        
        <div className={`${styles.actions} ${isSmall ? styles.actionsSmall : ''}`}>
          {cartQuantity === 0 ? (
            <>
              <button className={`${styles.buyNowBtn} ${isSmall ? styles.buyNowBtnSmall : ''}`} onClick={() => onBuyNow(product.id)}>
                Pesan
              </button>
              <button className={`${styles.cartIconBtn} ${isSmall ? styles.cartIconBtnSmall : ''}`} onClick={() => onUpdateQuantity(product.id, 1, product.name)} title="Tambah ke Keranjang">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </button>
            </>
          ) : (
            <div className={styles.quantityControl}>
              <button className={`${styles.qtyBtn} ${isSmall ? styles.qtyBtnSmall : ''}`} onClick={() => onUpdateQuantity(product.id, -1, product.name)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <span className={`${styles.qtyLabel} ${isSmall ? styles.qtyLabelSmall : ''}`}>{cartQuantity}</span>
              <button className={`${styles.qtyBtn} ${isSmall ? styles.qtyBtnSmall : ''}`} onClick={() => onUpdateQuantity(product.id, 1, product.name)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
