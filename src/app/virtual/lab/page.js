import styles from './Lab.module.css';

export const metadata = {
  title: "Digital Lab - ABSENKU / Dapur Arabella",
  description: "Pusat Pembelajaran & Dokumentasi Digital oleh Riki Iskandar",
};

export default function DigitalLabPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Digital Lab</h1>
        <p className={styles.subtitle}>Pusat Pembelajaran & Dokumentasi Digital</p>
      </header>
      <main className={styles.main}>
        <div className={styles.placeholderCard}>
          <h2>Digital Lab Ready 🧪</h2>
          <p>Folder dan rute halaman <code>/virtual/lab</code> telah berhasil dibuat.</p>
          <p>Siap untuk menerima deskripsi desain antarmuka dari Anda!</p>
        </div>
      </main>
    </div>
  );
}
