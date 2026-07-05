import { Package, Tags, Eye, Globe, Smartphone, Users } from "lucide-react";
import styles from "./Dashboard.module.css";
import prisma from "@/lib/prisma";
import { AreaChart, DonutChart } from "@/components/charts/DashboardCharts";

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
    take: 5
  });

  const browserStats = await prisma.pageView.groupBy({
    by: ['browser'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  // Generate mock chart data for views trend (last 7 days)
  // In a real scenario, this would be grouped by day from the DB
  const viewChartData = [12, 34, 23, 45, 60, 48, 89];
  const viewChartCategories = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Prepare Donut Chart Data
  const browserChartSeries = browserStats.map(stat => stat._count.id);
  const browserChartLabels = browserStats.map(stat => stat.browser || "Unknown");

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Top Row: Hero Card (8 cols) + Stats (4 cols) */}
      <div className={styles.topRow}>
        <div className={styles.heroCard}>
          <div className={styles.heroDecoration}></div>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>Performa Toko Bulan Ini</h2>
            <div className={styles.heroValue}>{totalViews} <span style={{fontSize: '1rem', fontWeight: '400'}}>Pengunjung</span></div>
          </div>
          <div className={styles.heroChart}>
            <AreaChart data={viewChartData} categories={viewChartCategories} height={180} color="#FFFFFF" />
          </div>
        </div>

        <div className={styles.statsWrapper}>
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
              <span className={styles.statTitle}>Pengguna Terdaftar</span>
              <div className={`${styles.iconWrapper} ${styles.orange}`}>
                <Users size={20} />
              </div>
            </div>
            <div className={styles.statValue}>{totalUsers}</div>
            <div className={styles.statDesc}>Akun aktif pelanggan</div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statTitle}>Status Sistem</span>
              <div className={`${styles.iconWrapper} ${styles.green}`}>
                <Eye size={20} />
              </div>
            </div>
            <div className={styles.statValue}>Aman</div>
            <div className={styles.statDesc}>Semua layanan berjalan lancar</div>
          </div>
        </div>
      </div>
      
      {/* Bottom Row: Insights */}
      <div className={styles.bottomRow}>
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
                {countryStats.map(stat => {
                  const percent = Math.min(100, Math.round((stat._count.id / totalViews) * 100)) || 0;
                  return (
                    <li key={stat.country} className={styles.insightItem}>
                      <div className={styles.insightItemHeader}>
                        <span className={styles.itemName}>
                          {stat.country === "Unknown" ? "Tidak Diketahui" : stat.country}
                        </span>
                        <span className={styles.itemValue}>{stat._count.id} ({percent}%)</span>
                      </div>
                      <div className={styles.progressBarContainer}>
                        <div className={styles.progressBarFill} style={{ width: `${percent}%` }}></div>
                      </div>
                    </li>
                  )
                })}
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
              <DonutChart data={browserChartSeries} labels={browserChartLabels} />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
