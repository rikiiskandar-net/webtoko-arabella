"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, Wallet, CalendarRange, AlertCircle, Loader2, Save, History, LogOut } from "lucide-react";
import styles from "../../(admin)/dashboard/attendance/Attendance.module.css";
import localStyles from "../Absen.module.css";

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getLocalToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [status, setStatus] = useState("Kerja Normal");
  const [baseWage, setBaseWage] = useState(100000); // Temporary default
  const [multiplier, setMultiplier] = useState(1);
  const [extraPay, setExtraPay] = useState(0);
  const [notes, setNotes] = useState("");

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
  };

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
        setBaseWage(attData.baseWage || 100000);
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

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    if (val === "Kerja Normal") setMultiplier(1);
    else if (val === "Lembur Penuh") setMultiplier(2);
    else if (val === "Setengah Hari") setMultiplier(0.5);
    else setMultiplier(1); // Custom or others
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/worker/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: data?.activePeriod?.id,
          date: selectedDate,
          status,
          baseWage: Number(baseWage),
          multiplier: Number(multiplier),
          extraPay: Number(extraPay),
          notes
        })
      });

      if (res.ok) {
        setSuccess("Absensi hari ini berhasil disimpan!");
        setNotes("");
        setExtraPay(0);
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal menyimpan absensi");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseBook = async () => {
    if (!confirm("Anda yakin ingin tutup buku? Ini akan mereset hitungan gaji untuk periode baru dan tidak dapat dibatalkan.")) return;
    
    try {
      const res = await fetch("/api/worker/attendance/period/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: data?.activePeriod?.id })
      });
      if (res.ok) {
        alert("Buku gaji berhasil ditutup! Memulai periode baru.");
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal menutup buku");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    }
  };

  if (loading) {
    return (
      <div className={localStyles.loadingContainer}>
        <Loader2 className={localStyles.spinner} size={40} />
      </div>
    );
  }

  const periodPay = data?.attendances?.reduce((sum, item) => sum + item.totalPay, 0) || 0;
  const currentTotal = Math.round(Number(baseWage) * Number(multiplier)) + Number(extraPay);

  return (
    <div className={styles.container}>
      {/* Header section identical to admin */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Absensi & Gaji</h1>
          <p className={styles.subtitle}>Catat kehadiran dan kelola gaji harian Anda dengan fleksibel.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.btnOutline}>
            <Wallet size={18} />
            Standar Gaji: {formatRupiah(baseWage)}/hari
          </div>
          <button className={localStyles.logoutBtn} onClick={handleLogout} title="Keluar">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox} style={{marginBottom: '1rem'}}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div className={styles.successBox} style={{marginBottom: '1rem'}}>
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      <div className={styles.grid}>
        {/* FORM PANEL */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Clock size={20} className={styles.iconBlue} /> Catat Kehadiran
          </h2>
          
          <form className={styles.form} onSubmit={handleCheckIn}>
            <div className={styles.formGroup}>
              <label>Pilih Tanggal</label>
              <input 
                type="date" 
                className={styles.input} 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Status Kehadiran</label>
              <select className={styles.input} value={status} onChange={handleStatusChange}>
                <option value="Kerja Normal">Kerja Normal (1x Gaji)</option>
                <option value="Setengah Hari">Setengah Hari (0.5x Gaji)</option>
                <option value="Lembur Penuh">Lembur Penuh (2x Gaji)</option>
                <option value="Sakit">Sakit (0x Gaji)</option>
                <option value="Izin">Izin (0x Gaji)</option>
                <option value="Absen">Absen (0x Gaji)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Nominal Gaji Pokok (Bisa Diedit)</label>
              <input 
                type="number" 
                className={styles.input} 
                value={baseWage}
                onChange={(e) => setBaseWage(e.target.value)}
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Tambahan Lembur Ekstra (Rp)</label>
              <input 
                type="number" 
                className={styles.input} 
                value={extraPay}
                onChange={(e) => setExtraPay(e.target.value)}
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Catatan (Opsional)</label>
              <input 
                type="text" 
                className={styles.input} 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bongkar muat barang..."
              />
            </div>

            <div className={styles.summaryBox}>
              Total Gaji Hari Ini:
              <strong>{formatRupiah(currentTotal)}</strong>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
              Simpan Absensi
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: STATS & HISTORY */}
        <div className={styles.panel}>
          <div className={styles.panelHeaderRow}>
            <h2 className={styles.panelTitle}>
              <CalendarRange size={20} className={styles.iconOrange} /> Buku Gaji Aktif
            </h2>
            <button className={styles.btnCloseBook} onClick={handleCloseBook}>
              Tutup Buku & Gajian
            </button>
          </div>

          <div className={styles.periodStats}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Mulai Periode</span>
              <span className={styles.statValue}>
                {data?.activePeriod ? new Date(data.activePeriod.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Total Terkumpul</span>
              <span className={styles.statValueHighlight}>{formatRupiah(periodPay)}</span>
            </div>
          </div>

          <h3 className={styles.listTitle}>Riwayat Kehadiran (Periode Ini)</h3>
          
          {data?.attendances?.length === 0 ? (
            <p className={styles.emptyText}>Belum ada data absen di periode ini.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Gaji</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.attendances?.map((att) => (
                    <tr key={att.id}>
                      <td>
                        <div className={styles.bold}>{new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                        {att.notes && <div style={{fontSize: '0.8rem', color: '#6B7280'}}>{att.notes}</div>}
                      </td>
                      <td>
                        <span className={styles.badge}>{att.status}</span>
                      </td>
                      <td className={styles.bold}>{formatRupiah(att.totalPay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
