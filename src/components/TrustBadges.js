import styles from "./TrustBadges.module.css";
import { Truck, BadgeCheck, ShieldCheck, Leaf } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    { icon: <Truck size={22} strokeWidth={2} color="var(--primary)" />, title: "Pengiriman Cepat", desc: "Tepat Waktu" },
    { icon: <BadgeCheck size={22} strokeWidth={2} color="var(--primary)" />, title: "Produk Homemade", desc: "Dibuat dengan Hati" },
    { icon: <ShieldCheck size={22} strokeWidth={2} color="var(--primary)" />, title: "Pembayaran Aman", desc: "Bebas Khawatir" },
    { icon: <Leaf size={22} strokeWidth={2} color="var(--primary)" />, title: "Bahan Berkualitas", desc: "100% Segar" },
  ];

  return (
    <div className={styles.container}>
      {badges.map((badge, idx) => (
        <div key={idx} className={styles.badgeCard}>
          <div className={styles.icon}>{badge.icon}</div>
          <div className={styles.textWrap}>
            <h4 className={styles.title}>{badge.title}</h4>
            <p className={styles.desc}>{badge.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
