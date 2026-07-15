"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2, CalendarCheck, CalendarMinus, Wallet } from "lucide-react";
import styles from "../Absen.module.css";

const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resUser = await fetch("/api/worker/auth/me");
      if (!resUser.ok) {
        router.push("/absen");
        return;
      }
      const userData = await resUser.json();
      setUser(userData.user);

      const resAtt = await fetch("/api/worker/attendance");
      if (resAtt.ok) {
        const attData = await resAtt.json();
        setData(attData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/worker/auth/logout", { method: "POST" });
    router.push("/absen");
  };

  const handleAbsen = async (status) => {
    if (!confirm(`Anda yakin ingin absen "${status}" hari ini?`)) return;
    setSubmitting(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch("/api/worker/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: data.activePeriod.id,
          date: today,
          status: status,
          notes: ""
        })
      });

      if (res.ok) {
        alert("Berhasil absen!");
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal absen");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
      </div>
    );
  }

  // Calculate total period pay
  const totalPeriodPay = data?.attendances?.reduce((sum, att) => sum + att.totalPay, 0) || 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const hasClockedInToday = data?.attendances?.some(a => a.date.startsWith(todayStr));

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Halo, {user?.name}</h1>
          <p className={styles.dashGreeting}>{user?.role} Proyek</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Keluar">
          <LogOut size={18} />
        </button>
      </div>

      <div className={styles.statsCard}>
        <div className={styles.statsLabel}>Total Gaji / Kasbon (Periode Ini)</div>
        <div className={styles.statsValue}>{formatRp(totalPeriodPay)}</div>
        <div className={styles.statsFooter}>
          <span>Dari {data?.activePeriod?.startDate ? new Date(data.activePeriod.startDate).toLocaleDateString('id-ID') : '-'}</span>
          <Wallet size={16} color="#94a3b8" />
        </div>
      </div>

      <div className={styles.actionSection}>
        <h2 className={styles.actionTitle}>Absen Hari Ini</h2>
        {hasClockedInToday ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#16a34a', fontWeight: 'bold' }}>
            ✓ Anda sudah absen hari ini
          </div>
        ) : (
          <div className={styles.buttonGrid}>
            <button 
              className={`${styles.absenBtn} ${styles.btnHadir}`} 
              onClick={() => handleAbsen("Hadir")}
              disabled={submitting}
            >
              {submitting ? <Loader2 className={styles.spinner} size={24} /> : <CalendarCheck size={28} />}
              <span>Hadir Penuh</span>
            </button>
            <button 
              className={`${styles.absenBtn} ${styles.btnSetengah}`}
              onClick={() => handleAbsen("Setengah Hari")}
              disabled={submitting}
            >
              {submitting ? <Loader2 className={styles.spinner} size={24} /> : <CalendarMinus size={28} />}
              <span>Setengah Hari</span>
            </button>
          </div>
        )}
      </div>

      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>Riwayat Kehadiran</h2>
        <div className={styles.historyList}>
          {data?.attendances?.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>Belum ada absen</div>
          ) : (
            data?.attendances?.map(att => (
              <div key={att.id} className={styles.historyCard}>
                <div>
                  <div className={styles.historyDate}>{new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
                  <span className={`${styles.historyStatus} ${att.status === 'Hadir' ? styles.statusHadir : styles.statusSetengah}`}>
                    {att.status}
                  </span>
                </div>
                <div className={styles.historyPay}>
                  +{formatRp(att.totalPay)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
