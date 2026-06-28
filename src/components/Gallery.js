/* eslint-disable @next/next/no-img-element */
"use client";
import styles from "./Gallery.module.css";

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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
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
