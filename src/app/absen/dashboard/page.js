"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Wallet, CalendarRange, AlertCircle, Loader2, Save, LogOut, CheckCircle2 } from "lucide-react";
import styles from "./Dashboard.module.css";

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
  const [baseWage, setBaseWage] = useState(100000);
  const [multiplier, setMultiplier] = useState(1);
  const [extraPay, setExtraPay] = useState(0);
  const [notes, setNotes] = useState("");

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
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
    else setMultiplier(1);
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
        setSuccess("Berhasil absen hari ini!");
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
    if (!confirm("Tutup buku dan mulai perhitungan baru?")) return;
    
    try {
      const res = await fetch("/api/worker/attendance/period/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: data?.activePeriod?.id })
      });
      if (res.ok) {
        alert("Buku gaji berhasil ditutup!");
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
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f8fafc'}}>
        <Loader2 className={styles.spinner} size={40} color="#3b82f6" />
      </div>
    );
  }

  const periodPay = data?.attendances?.reduce((sum, item) => sum + item.totalPay, 0) || 0;
  const currentTotal = Math.round(Number(baseWage) * Number(multiplier)) + Number(extraPay);

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Absensi & Gaji</h1>
          <p className={styles.subtitle}>Catat kehadiran dan kelola pendapatan harian Anda.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.wageBadge}>
            <Wallet size={18} />
            {formatRupiah(baseWage)} / hari
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Keluar">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {success && (
        <div className={styles.successBox}>
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      <div className={styles.grid}>
        {/* RIGHT PANEL: STATS & HISTORY (Moved to top on mobile for better UX) */}
        <div className={styles.panel} style={{background: 'transparent', boxShadow: 'none', padding: '0'}}>
          <div className={styles.statCardPremium}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span className={styles.statLabel}>Buku Gaji Aktif</span>
              <CalendarRange size={24} color="#34d399" />
            </div>
            <span className={styles.statValueHighlight}>{formatRupiah(periodPay)}</span>
            <span className={styles.statSubtext}>
              Mulai: {data?.activePeriod ? new Date(data.activePeriod.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
            </span>
          </div>
          
          <div style={{marginTop: '1rem'}}>
             <button className={styles.btnCloseBook} onClick={handleCloseBook}>
                Tutup Buku & Gajian
             </button>
          </div>
        </div>

        {/* LEFT PANEL: FORM */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Clock size={20} className={styles.iconBlue} /> Form Kehadiran
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
              <label>Gaji Pokok (Bisa Diedit)</label>
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
              <label>Tambahan Lembur (Rp)</label>
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
                placeholder="Misal: Lembur bongkar muat..."
              />
            </div>

            <div className={styles.summaryBox}>
              Total Gaji Hari Ini
              <strong>{formatRupiah(currentTotal)}</strong>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? <Loader2 size={20} className={styles.spinner} /> : <Save size={20} />}
              Simpan Absensi
            </button>
          </form>
        </div>

        {/* BOTTOM PANEL: HISTORY LIST */}
        <div className={styles.panel}>
          <h3 className={styles.listTitle}>Riwayat (Periode Ini)</h3>
          
          {data?.attendances?.length === 0 ? (
            <p className={styles.emptyText}>Belum ada riwayat absensi.</p>
          ) : (
            <div className={styles.historyList}>
              {data?.attendances?.map((att) => (
                <div className={styles.historyCard} key={att.id}>
                  <div className={styles.historyLeft}>
                    <span className={styles.historyDate}>
                      {new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className={styles.historyBadge}>{att.status}</span>
                  </div>
                  <div className={styles.historyRight}>
                    <span className={styles.historyPay}>{formatRupiah(att.totalPay)}</span>
                    {att.notes && <span className={styles.historyNotes}>{att.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
