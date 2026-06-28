import { Package, Tags, Eye } from "lucide-react";
import styles from "./Dashboard.module.css";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | Dapur Arabella",
};

export default async function DashboardPage() {
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalViews = 1250; // Contoh stat (bisa diganti nanti)

  return (
    <div>
      <h2 className={styles.sectionTitle}>Ringkasan Bisnis Anda</h2>
      
      <div className={styles.dashboardGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Total Produk Aktif</span>
            <div className={`${styles.iconWrapper} ${styles.blue}`}>
              <Package size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{totalProducts}</div>
          <div className={styles.statDesc}>Menu yang tampil di website</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Total Kategori</span>
            <div className={`${styles.iconWrapper} ${styles.purple}`}>
              <Tags size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{totalCategories}</div>
          <div className={styles.statDesc}>Pengelompokan menu masakan</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Pengunjung Bulan Ini</span>
            <div className={`${styles.iconWrapper} ${styles.green}`}>
              <Eye size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{totalViews}</div>
          <div className={styles.statDesc}>Dari mesin pencari & media sosial</div>
        </div>
      </div>
      
      {/* Nanti kita bisa tambah grafik atau log aktivitas di sini */}
    </div>
  );
}
