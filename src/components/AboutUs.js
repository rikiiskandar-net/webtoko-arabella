/* eslint-disable @next/next/no-img-element */
"use client";
import { CheckCircle2 } from "lucide-react";
import styles from "./AboutUs.module.css";

export default function AboutUs() {
  const points = [
    "Tanpa Bahan Pengawet",
    "Bahan Bumbu Pilihan",
    "Kebersihan Terjamin",
    "Dibuat Terbatas (Fresh)"
  ];

  return (
    <section className={styles.aboutSection} id="tentang-kami">
      <div className={styles.container}>
        <div className={styles.imageColumn}>
          <img src="/images/about_us.jpg" alt="Dapur Arabella Kitchen" className={styles.mainImage} />
          <div className={styles.floatingBadge}>
            <span className={styles.badgeNumber}>100%</span>
            <span className={styles.badgeText}>Buatan<br/>Tangan</span>
          </div>
        </div>
        
        <div className={styles.contentColumn}>
          <h2 className={styles.subtitle}>Tentang Kami</h2>
          <h3 className={styles.title}>Berawal dari Camilan Sehat untuk Anak</h3>
          <p className={styles.description}>
            Dapur Arabella memang baru seumur jagung, tapi kecintaan kami pada masakan rumahan sudah ada sejak lama. Semuanya berawal dari hobi memasak dan keisengan membuatkan camilan sore yang aman untuk anak-anak di rumah. Ternyata, saat tetangga ikut mencicipi, mereka sangat menyukainya dan mulai ikut memesan! 
            <br/><br/>
            Dari dorongan merekalah Dapur Arabella akhirnya lahir. Karena pada dasarnya masakan ini kami buat untuk keluarga sendiri, kami sangat cerewet soal kebersihan dan pantang menggunakan bahan pengawet.
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
