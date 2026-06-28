import styles from "./FloatingCart.module.css";

export default function FloatingCart({ itemCount, totalPrice, onClick }) {
  if (itemCount === 0) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <button className={styles.floatingBtn} onClick={onClick}>
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
    </button>
  );
}
