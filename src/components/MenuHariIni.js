import styles from "./MenuHariIni.module.css";
import { Flame, Clock3, Bike } from "lucide-react";

export default function MenuHariIni({ hours, deliveryETA }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Flame size={24} strokeWidth={2} color="#DC2626" />
        <h3 className={styles.title}>Menu Hari Ini</h3>
      </div>
      <div className={styles.infoList}>
        <div className={styles.infoItem}>
          <Clock3 size={18} strokeWidth={2} color="var(--accent)" />
          <span>{hours || "Tutup pukul 21.00"}</span>
        </div>
        <div className={styles.infoItem}>
          <Bike size={18} strokeWidth={2} color="var(--accent)" />
          <span>{deliveryETA || "Antar mulai 15 menit"}</span>
        </div>
      </div>
    </div>
  );
}
