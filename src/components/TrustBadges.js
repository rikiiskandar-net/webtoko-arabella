import styles from "./TrustBadges.module.css";
import { Truck, BadgeCheck, ShieldCheck, Leaf } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    { icon: <Truck size={22} strokeWidth={2} color="var(--primary)" />, title: "Dikirim Hari Ini", desc: "Via Gojek/Grab Instan" },
    { icon: <BadgeCheck size={22} strokeWidth={2} color="var(--primary)" />, title: "100% Homemade", desc: "Tanpa Bahan Pengawet" },
    { icon: <ShieldCheck size={22} strokeWidth={2} color="var(--primary)" />, title: "Garansi Kualitas", desc: "Uang Kembali Jika Basi" },
    { icon: <Leaf size={22} strokeWidth={2} color="var(--primary)" />, title: "Selalu Fresh", desc: "Dibuat Baru Setiap Hari" },
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
