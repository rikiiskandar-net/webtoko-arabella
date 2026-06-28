import Link from "next/link";
import { ArrowLeft, Heart, Award, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
  title: "Tentang Kami - Dapur Arabella",
};

export default function TentangKamiPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>

        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <Heart size={32} />
          </div>
          <h1 className={styles.title}>Tentang Dapur Arabella</h1>
          <p className={styles.subtitle}>
            Cerita di balik setiap hidangan yang kami sajikan dengan cinta.
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Siapa Kami?</h2>
            <p className={styles.text}>
              Dapur Arabella adalah rumah produksi rumahan yang berdedikasi menyajikan aneka jajanan Nusantara, 
              camilan kekinian, dan frozen food berkualitas premium. Berawal dari kecintaan terhadap 
              kuliner tradisional, kami menghadirkan cita rasa rumahan yang autentik dengan 
              sentuhan modern.
            </p>
            <p className={styles.text}>
              Setiap produk dibuat dengan bahan-bahan segar dan berkualitas terbaik, tanpa bahan 
              pengawet berbahaya. Kami percaya bahwa makanan yang enak berasal dari bahan yang baik 
              dan hati yang tulus.
            </p>
          </section>

          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon} style={{ background: "#EFF6FF", color: "#2563EB" }}>
                <Sparkles size={24} />
              </div>
              <h3 className={styles.valueTitle}>Bahan Berkualitas</h3>
              <p className={styles.valueText}>Kami hanya menggunakan bahan-bahan segar dan premium untuk setiap produk.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon} style={{ background: "#FFFBEB", color: "#D97706" }}>
                <Award size={24} />
              </div>
              <h3 className={styles.valueTitle}>Racikan Khas</h3>
              <p className={styles.valueText}>Resep rahasia turun-temurun dengan cita rasa yang khas dan otentik.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon} style={{ background: "#F0FDF4", color: "#16A34A" }}>
                <ShieldCheck size={24} />
              </div>
              <h3 className={styles.valueTitle}>Higienis & Aman</h3>
              <p className={styles.valueText}>Diproduksi dengan standar kebersihan tinggi. Halal dan aman dikonsumsi.</p>
            </div>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Visi & Misi</h2>
            <div className={styles.visiGrid}>
              <div className={styles.visiCard}>
                <h3 className={styles.visiLabel}>Visi</h3>
                <p className={styles.text}>
                  Menjadi brand kuliner rumahan terpercaya yang menghadirkan kebahagiaan 
                  melalui cita rasa Nusantara di setiap meja makan.
                </p>
              </div>
              <div className={styles.visiCard}>
                <h3 className={styles.visiLabel}>Misi</h3>
                <p className={styles.text}>
                  Menyajikan produk berkualitas tinggi dengan harga terjangkau, 
                  memberikan pelayanan terbaik, dan terus berinovasi dalam menciptakan 
                  varian rasa baru yang disukai semua kalangan.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
