"use client";
import styles from "./Gallery.module.css";
import { Instagram } from "lucide-react";

export default function Gallery() {
  const images = [
    { id: 1, src: "/images/gallery_prep.jpg", alt: "Persiapan adonan segar" },
    { id: 2, src: "/images/gallery_cook.jpg", alt: "Proses penggorengan higienis" },
    { id: 3, src: "/images/gallery_pack.jpg", alt: "Pengemasan rapi dan aman" },
  ];

  return (
    <section className={styles.gallerySection}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.subtitle}>Dapur Kami</h2>
          <h3 className={styles.title}>Mengintip Proses Produksi</h3>
        </div>
        <a href="https://instagram.com/dapurarabella" target="_blank" rel="noopener noreferrer" className={styles.igButton}>
          <Instagram size={18} />
          Ikuti Kami
        </a>
      </div>
      
      <div className={styles.grid}>
        {images.map((img) => (
          <div key={img.id} className={styles.imageWrapper}>
            <img src={img.src} alt={img.alt} className={styles.image} />
            <div className={styles.overlay}>
              <span className={styles.caption}>{img.alt}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
