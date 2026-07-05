import { Package, Tags, Eye, Globe, Smartphone, Users } from "lucide-react";
import styles from "./Dashboard.module.css";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | Dapur Arabella",
};

export default async function DashboardPage() {
  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  const totalUsers = await prisma.user.count({ where: { isActive: true } });
  
  // Analytics queries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalViews = await prisma.pageView.count({
    where: { createdAt: { gte: startOfMonth } }
  });

  const countryStats = await prisma.pageView.groupBy({
    by: ['country'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 4
  });

  const browserStats = await prisma.pageView.groupBy({
    by: ['browser'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 4
  });

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
          <div className={styles.statDesc}>Dari seluruh sumber organik</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Pengguna Terdaftar</span>
            <div className={`${styles.iconWrapper} ${styles.orange}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{totalUsers}</div>
          <div className={styles.statDesc}>Akun aktif pelanggan</div>
        </div>
      </div>
      
      {/* Analytics Insights */}
      <div className={styles.insightsWrapper}>
        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <Globe size={18} className={styles.insightIcon} />
            <h3 className={styles.insightTitle}>Top Negara</h3>
          </div>
          <div className={styles.insightBody}>
            {countryStats.length === 0 ? (
              <p className={styles.noData}>Belum ada data kunjungan.</p>
            ) : (
              <ul className={styles.insightList}>
                {countryStats.map(stat => (
                  <li key={stat.country} className={styles.insightItem}>
                    <span className={styles.itemName}>{stat.country === "Unknown" ? "Tidak Diketahui" : stat.country}</span>
                    <span className={styles.itemValue}>{stat._count.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <Smartphone size={18} className={styles.insightIcon} />
            <h3 className={styles.insightTitle}>Top Browser</h3>
          </div>
          <div className={styles.insightBody}>
            {browserStats.length === 0 ? (
              <p className={styles.noData}>Belum ada data kunjungan.</p>
            ) : (
              <ul className={styles.insightList}>
                {browserStats.map(stat => (
                  <li key={stat.browser} className={styles.insightItem}>
                    <span className={styles.itemName}>{stat.browser}</span>
                    <span className={styles.itemValue}>{stat._count.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
