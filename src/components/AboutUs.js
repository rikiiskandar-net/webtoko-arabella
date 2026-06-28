/* eslint-disable @next/next/no-img-element */
"use client";
import { CheckCircle2 } from "lucide-react";
import styles from "./AboutUs.module.css";

export default function AboutUs() {
  const points = [
    "100% Tanpa Bahan Pengawet",
    "Resep Rahasia Keluarga",
    "Dibuat Segar Setiap Hari",
    "Kebersihan Terjamin"
  ];

  return (
    <section className={styles.aboutSection} id="tentang-kami">
      <div className={styles.container}>
        <div className={styles.imageColumn}>
          <img src="/images/about_us.jpg" alt="Dapur Arabella Kitchen" className={styles.mainImage} />
          <div className={styles.floatingBadge}>
            <span className={styles.badgeNumber}>10+</span>
            <span className={styles.badgeText}>Tahun<br/>Pengalaman</span>
          </div>
        </div>
        
        <div className={styles.contentColumn}>
          <h2 className={styles.subtitle}>Tentang Kami</h2>
          <h3 className={styles.title}>Menyajikan Kehangatan dari Dapur Rumah</h3>
          <p className={styles.description}>
            Berawal dari resep keluarga turun-temurun, Dapur Arabella berdedikasi untuk menghadirkan camilan lezat dan sehat. Kami percaya bahwa makanan terbaik lahir dari bahan-bahan pilihan yang segar, diolah dengan tangan penuh cinta, dan disajikan dengan standar kebersihan tertinggi.
          </p>
          <div className={styles.pointsGrid}>
            {points.map((point, index) => (
              <div key={index} className={styles.pointItem}>
                <CheckCircle2 size={20} className={styles.checkIcon} />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
