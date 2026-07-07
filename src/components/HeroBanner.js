"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./HeroBanner.module.css";

export default function HeroBanner({ initialBanners = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (initialBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % initialBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [initialBanners.length]);

  if (!initialBanners || initialBanners.length === 0 || !initialBanners[current]) return null;

  const banner = initialBanners[current];

  return (
    <div className={styles.banner}>
      <div className={styles.backgroundGlow}></div>
      <div className={styles.imageWrapper}>
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          priority={current === 0} // LCP optimization: preloads the first banner
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          quality={85}
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

      {initialBanners.length > 1 && (
        <div className={styles.dots}>
          {initialBanners.map((_, i) => (
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
