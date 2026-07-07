"use client";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import styles from "./AboutUs.module.css";

export default function AboutUs({ config }) {
  const points = config?.aboutPoints ? config.aboutPoints.split(',').map(p => p.trim()) : [
    "Tanpa Bahan Pengawet",
    "Bahan Bumbu Pilihan",
    "Kebersihan Terjamin",
    "Dibuat Terbatas (Fresh)"
  ];

  const title = config?.aboutTitle || "Berawal dari Camilan Sehat untuk Anak";
  const description = config?.aboutDescription || "Dapur Arabella memang baru seumur jagung, tapi kecintaan kami pada masakan rumahan sudah ada sejak lama. Semuanya berawal dari hobi memasak dan keisengan membuatkan camilan sore yang aman untuk anak-anak di rumah. Ternyata, saat tetangga ikut mencicipi, mereka sangat menyukainya dan mulai ikut memesan!\n\nDari dorongan merekalah Dapur Arabella akhirnya lahir. Karena pada dasarnya masakan ini kami buat untuk keluarga sendiri, kami sangat cerewet soal kebersihan dan pantang menggunakan bahan pengawet.";
  const badgeNumber = config?.aboutBadgeNumber || "100%";
  const badgeText = config?.aboutBadgeText || "Buatan\nTangan";
  const image = config?.aboutImage || "/images/about_us.jpg";

  return (
    <section className={styles.aboutSection} id="tentang-kami">
      <div className={styles.container}>
        <div className={styles.imageColumn}>
          <Image 
            src={image} 
            alt="Dapur Arabella" 
            width={600}
            height={500}
            className={styles.mainImage} 
            loading="lazy"
            sizes="(max-width: 992px) 100vw, 50vw"
          />
          <div className={styles.floatingBadge}>
            <span className={styles.badgeNumber}>{badgeNumber}</span>
            <span className={styles.badgeText}>
              {badgeText.split('\\n').map((line, i) => (
                <span key={i}>{line}<br/></span>
              ))}
            </span>
          </div>
        </div>
        
        <div className={styles.contentColumn}>
          <h2 className={styles.subtitle}>Tentang Kami</h2>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description} style={{ whiteSpace: 'pre-wrap' }}>
            {description}
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
