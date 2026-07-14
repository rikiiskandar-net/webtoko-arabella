"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Wallet, CalendarRange, AlertCircle, Loader2, Save } from "lucide-react";
import styles from "./Attendance.module.css";

export default function AttendanceClient({ adminId, adminName }) {
  const [period, setPeriod] = useState(null);
  const [baseWage, setBaseWage] = useState(120000);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [status, setStatus] = useState("Kerja Normal");
  const [multiplier, setMultiplier] = useState(1);
  const [extraPay, setExtraPay] = useState(0);
  const [notes, setNotes] = useState("");

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
  };

  const fetchPeriod = async () => {
    try {
      const res = await fetch("/api/admin/attendance/period");
      const data = await res.json();
      if (res.ok) {
        setPeriod(data.period);
        setBaseWage(data.baseWage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriod();
  }, []);

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatus(val);
    if (val === "Kerja Normal") setMultiplier(1);
    else if (val === "Lembur Penuh") setMultiplier(2);
    else if (val === "Setengah Hari") setMultiplier(0.5);
    else setMultiplier(1); // Custom or others
  };

  const handleUpdateBaseWage = async () => {
    const newWage = prompt("Masukkan Standar Gaji Harian Baru (contoh: 150000):", baseWage);
    if (newWage && !isNaN(newWage)) {
      try {
        const res = await fetch("/api/admin/settings/wage", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baseWage: Number(newWage) })
        });
        if (res.ok) {
          setBaseWage(Number(newWage));
          alert("Gaji standar berhasil diperbarui!");
        }
      } catch (e) {
        alert("Gagal update gaji");
      }
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId: period.id,
          date: new Date().toISOString(),
          status,
          baseWage,
          multiplier,
          extraPay,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan absen");
      } else {
        setSuccess("Absen hari ini berhasil dicatat!");
        fetchPeriod(); // Refresh data
        // Reset form slightly
        setExtraPay(0);
        setNotes("");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePeriod = async () => {
    if (!confirm("Tutup Buku sekarang? Sesi ini akan ditutup dan Anda bisa mulai periode baru esok hari.")) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/attendance/period/close", {
        method: "POST"
      });
      if (res.ok) {
        alert("Buku berhasil ditutup! Total gaji periode ini telah diakumulasi.");
        fetchPeriod();
      } else {
        alert("Gagal menutup buku.");
      }
    } catch (e) {
      alert("Error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingState}><Loader2 className={styles.spinner} /> Memuat data...</div>;
  }

  // Cek apakah hari ini sudah absen
  const todayDate = new Date();
  todayDate.setUTCHours(0,0,0,0);
  const alreadyCheckedIn = period?.attendances?.some(att => {
    const attDate = new Date(att.date);
    return attDate.getTime() === todayDate.getTime();
  });

  const totalPeriodPay = period?.attendances?.reduce((sum, att) => sum + att.totalPay, 0) || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Absensi & Gaji</h1>
          <p className={styles.subtitle}>Catat kehadiran dan kelola gaji harian Anda dengan fleksibel.</p>
        </div>
        <button onClick={handleUpdateBaseWage} className={styles.btnOutline}>
          <Wallet size={16} /> Standar Gaji: {formatRupiah(baseWage)}/hari
        </button>
      </div>

      <div className={styles.grid}>
        {/* Panel Kiri: Form Absen */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Clock size={20} className={styles.iconBlue} /> Form Absen Hari Ini
          </h2>
          <p className={styles.dateText}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          {alreadyCheckedIn ? (
            <div className={styles.successState}>
              <CheckCircle2 size={48} className={styles.iconGreen} />
              <h3>Anda sudah absen hari ini!</h3>
              <p>Selamat beristirahat atau lanjutkan pekerjaan dengan semangat.</p>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className={styles.form}>
              {error && <div className={styles.errorBox}><AlertCircle size={16}/> {error}</div>}
              {success && <div className={styles.successBox}><CheckCircle2 size={16}/> {success}</div>}
              
              <div className={styles.formGroup}>
                <label>Status Kehadiran</label>
                <select value={status} onChange={handleStatusChange} className={styles.input}>
                  <option value="Kerja Normal">Kerja Normal (1x Gaji)</option>
                  <option value="Lembur Penuh">Lembur Penuh (2x Gaji)</option>
                  <option value="Setengah Hari">Setengah Hari (0.5x Gaji)</option>
                  <option value="Kustom">Kustom (Atur Pengali Manual)</option>
                </select>
              </div>

              {status === "Kustom" && (
                <div className={styles.formGroup}>
                  <label>Pengali Gaji (Multiplier)</label>
                  <input type="number" step="0.1" value={multiplier} onChange={e => setMultiplier(e.target.value)} className={styles.input} />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Nominal Gaji Pokok (Bisa Diedit)</label>
                <input type="number" value={baseWage} onChange={e => setBaseWage(Number(e.target.value))} className={styles.input} />
              </div>

              <div className={styles.formGroup}>
                <label>Tambahan Lembur Ekstra (Rp)</label>
                <input type="number" value={extraPay} onChange={e => setExtraPay(Number(e.target.value))} className={styles.input} placeholder="Contoh: 50000" />
              </div>

              <div className={styles.formGroup}>
                <label>Catatan (Opsional)</label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={styles.input} placeholder="Bongkar muat barang..." />
              </div>

              <div className={styles.summaryBox}>
                <span>Total Gaji Hari Ini:</span>
                <strong>{formatRupiah((baseWage * multiplier) + extraPay)}</strong>
              </div>

              <button type="submit" disabled={submitting} className={styles.btnPrimary}>
                {submitting ? <Loader2 size={18} className={styles.spinner} /> : <Save size={18} />}
                Simpan Absen
              </button>
            </form>
          )}
        </div>

        {/* Panel Kanan: Ringkasan Periode */}
        <div className={styles.panel}>
          <div className={styles.panelHeaderRow}>
            <h2 className={styles.panelTitle}>
              <CalendarRange size={20} className={styles.iconOrange} /> Buku Gaji Aktif
            </h2>
            <button onClick={handleClosePeriod} disabled={submitting} className={styles.btnCloseBook}>
              Tutup Buku & Gajian
            </button>
          </div>
          
          <div className={styles.periodStats}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Mulai Periode</span>
              <span className={styles.statValue}>
                {period?.startDate ? new Date(period.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Total Terkumpul</span>
              <span className={styles.statValueHighlight}>{formatRupiah(totalPeriodPay)}</span>
            </div>
          </div>

          <h3 className={styles.listTitle}>Riwayat Kehadiran (Periode Ini)</h3>
          {period?.attendances?.length === 0 ? (
            <p className={styles.emptyText}>Belum ada data absen di periode ini.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Gaji Pokok</th>
                    <th>Tambahan</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {period?.attendances?.map(att => (
                    <tr key={att.id}>
                      <td>{new Date(att.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}</td>
                      <td>
                        <span className={styles.badge}>{att.status}</span>
                      </td>
                      <td>{formatRupiah(att.baseWage * att.multiplier)}</td>
                      <td>{att.extraPay > 0 ? formatRupiah(att.extraPay) : '-'}</td>
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
