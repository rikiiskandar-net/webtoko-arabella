import { useState, useEffect } from "react";
import styles from "./FloatingCart.module.css";

export default function FloatingCart({ itemCount, totalPrice, discountablePrice = 0, onClick }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (itemCount > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  if (itemCount === 0) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextThreshold = (Math.floor(discountablePrice / 10000) + 1) * 10000;
  const remaining = nextThreshold - discountablePrice;
  const progressPercent = (discountablePrice % 10000) / 10000 * 100;
  
  const isMilestone = discountablePrice > 0 && discountablePrice % 10000 === 0;
  const displayPercent = isMilestone ? 100 : progressPercent;

  return (
    <div className={`${styles.floatingWrapper} ${pulse ? styles.pulse : ''}`} onClick={onClick}>
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarFill} style={{ width: `${displayPercent}%` }}></div>
        <div className={styles.progressText}>
          {isMilestone 
            ? "✨ Yeay! Extra Diskon Terbuka! ✨" 
            : `Tambah ${formatPrice(remaining)} lagi u/ ekstra diskon 1k!`}
        </div>
      </div>
      <button className={styles.floatingBtn}>
        <div className={styles.leftContent}>
          <div className={styles.iconWrap}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <div className={styles.details}>
            <span className={styles.count}>{itemCount} Item</span>
            <span className={styles.price}>{formatPrice(totalPrice)}</span>
          </div>
        </div>
        <div className={styles.rightContent}>
          Lihat Keranjang
        </div>
      </button>
    </div>
  );
}
