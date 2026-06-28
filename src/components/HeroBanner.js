"use client";

import { useState, useEffect } from "react";
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/store/banners")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBanners(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0 || !banners[current]) return null;

  const banner = banners[current];

  return (
    <div className={styles.banner}>
      <div className={styles.backgroundGlow}></div>
      <div className={styles.imageWrapper}>
        <img
          src={banner.image}
          alt={banner.title}
          className={styles.image}
        />
      </div>
      <div className={styles.gradientOverlay}></div>

      <div className={styles.content}>
        <div className={styles.textSection}>
          {banner.badge && <div className={styles.badge}>{banner.badge}</div>}
          <h2 className={styles.title}>{banner.title}</h2>
          {banner.subtitle && <p className={styles.subtitle}>{banner.subtitle}</p>}
          <button
            className={styles.ctaBtn}
            onClick={() => document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" })}
          >
            {banner.ctaText || "Eksplor Menu Sekarang"}
          </button>
        </div>
      </div>

      {banners.length > 1 && (
        <div className={styles.dots}>
          {banners.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.activeDot : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
