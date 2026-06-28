import Link from "next/link";
import { ArrowLeft, Search, ShoppingCart, MessageCircle, CheckCircle, ClipboardList, Wallet, Truck } from "lucide-react";
import styles from "./page.module.css";

export const metadata = {
  title: "Cara Pemesanan - Dapur Arabella",
};

const steps = [
  {
    icon: Search,
    title: "Jelajahi Menu",
    desc: "Lihat-lihat katalog produk kami di halaman utama. Filter berdasarkan kategori atau cari langsung nama produk favoritmu.",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    icon: ShoppingCart,
    title: "Pilih & Masukkan Keranjang",
    desc: "Klik produk yang kamu suka, tentukan jumlah, lalu masukkan ke keranjang. Kamu bisa pesan banyak item sekaligus.",
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    icon: ClipboardList,
    title: "Review Pesanan",
    desc: "Buka keranjang untuk memeriksa kembali pesananmu. Pastikan nama produk dan jumlah sudah sesuai.",
    color: "#16A34A",
    bg: "#F0FDF4",
  },
  {
    icon: MessageCircle,
    title: "Checkout via WhatsApp",
    desc: "Klik tombol 'Pesan Lewat WA', kami akan mengarahkanmu ke WhatsApp dengan ringkasan pesanan otomatis.",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    icon: Wallet,
    title: "Konfirmasi & Pembayaran",
    desc: "Kami akan membalas dengan informasi total harga, nomor rekening, dan estimasi pengiriman. Transfer sesuai nominal.",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    icon: Truck,
    title: "Pesanan Diproses & Dikirim",
    desc: "Setelah pembayaran dikonfirmasi, pesananmu akan segera kami proses dan kirim. Kami akan kabari nomor resi jika ada.",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
];

export default function CaraPemesananPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>

        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <ClipboardList size={32} />
          </div>
          <h1 className={styles.title}>Cara Pemesanan</h1>
          <p className={styles.subtitle}>
            Mudah! Ikuti langkah-langkah berikut untuk memesan produk Dapur Arabella.
          </p>
        </div>

        <div className={styles.timeline}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNumber}>{i + 1}</div>
                <div className={styles.stepIcon} style={{ background: step.bg, color: step.color }}>
                  <Icon size={24} />
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.ctaCard}>
          <CheckCircle size={24} style={{ color: "#16A34A" }} />
          <p className={styles.ctaText}>
            Siap mencoba? Langsung aja pesan sekarang!
          </p>
          <Link href="/" className={styles.ctaBtn}>
            Mulai Pesan
          </Link>
        </div>
      </div>
    </div>
  );
}
