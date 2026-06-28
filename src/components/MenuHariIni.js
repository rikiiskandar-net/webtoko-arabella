import styles from "./MenuHariIni.module.css";
import { Sparkles, ShieldCheck, BadgeCheck, Gift } from "lucide-react";

export default function MenuHariIni() {
  return (
    <div className={styles.marqueeContainer}>
      <div className={styles.marqueeContent}>
        <span className={styles.promoItem}>
          <Sparkles size={16} className={styles.icon} /> 100% Homemade
        </span>
        <span className={styles.separator}>•</span>
        <span className={styles.promoItem}>
          <ShieldCheck size={16} className={styles.icon} /> Tanpa Pengawet
        </span>
        <span className={styles.separator}>•</span>
        <span className={styles.promoItem}>
          <BadgeCheck size={16} className={styles.icon} /> Higienis & Halal
        </span>
        <span className={styles.separator}>•</span>
        <span className={styles.promoItem}>
          <Gift size={16} className={styles.iconHighlight} /> <strong>Promo Spesial:</strong> Beli 3 Pack Frozen Food, Gratis 1 Es Mambo!
        </span>
      </div>
      {/* Duplikat konten untuk membuat efek animasi scroll yang mulus dan tidak terputus */}
      <div className={styles.marqueeContent} aria-hidden="true">
        <span className={styles.promoItem}>
          <Sparkles size={16} className={styles.icon} /> 100% Homemade
        </span>
        <span className={styles.separator}>•</span>
        <span className={styles.promoItem}>
          <ShieldCheck size={16} className={styles.icon} /> Tanpa Pengawet
        </span>
        <span className={styles.separator}>•</span>
        <span className={styles.promoItem}>
          <BadgeCheck size={16} className={styles.icon} /> Higienis & Halal
        </span>
        <span className={styles.separator}>•</span>
        <span className={styles.promoItem}>
          <Gift size={16} className={styles.iconHighlight} /> <strong>Promo Spesial:</strong> Beli 3 Pack Frozen Food, Gratis 1 Es Mambo!
        </span>
      </div>
    </div>
  );
}
