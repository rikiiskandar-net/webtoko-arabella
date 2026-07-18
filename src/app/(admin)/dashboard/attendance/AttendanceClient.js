"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Wallet, CalendarRange, AlertCircle, Loader2, Save, Trash2, History, Users } from "lucide-react";
import Link from "next/link";
import styles from "./Attendance.module.css";

export default function AttendanceClient({ adminId, adminName }) {
  const [workers, setWorkers] = useState([]);
  const [activePeriods, setActivePeriods] = useState([]);
  const [attendances, setAttendances] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const getLocalToday = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [status, setStatus] = useState("Kerja Normal");
  const [baseWage, setBaseWage] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [extraPay, setExtraPay] = useState(0);
  const [notes, setNotes] = useState("");

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  const fetchPeriods = async () => {
    try {
      const res = await fetch("/api/admin/attendance/period");
      const data = await res.json();
      if (res.ok) {
        setWorkers(data.workers || []);
        setActivePeriods(data.activePeriods || []);
        setAttendances(data.attendances || []);
        
        // Auto select first worker if not selected
        if (!selectedWorkerId && data.workers && data.workers.length > 0) {
          const fw = data.workers[0];
          setSelectedWorkerId(fw.id);
          setBaseWage(fw.baseWage);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleWorkerChange = (e) => {
    const wid = e.target.value;
    setSelectedWorkerId(wid);
    const worker = workers.find(w => w.id === wid);
    if (worker) {
      setBaseWage(worker.baseWage);
    }
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
    if (!selectedWorkerId) {
      setError("Pilih pekerja terlebih dahulu");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: selectedWorkerId,
          date: selectedDate,
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
        setSuccess("Absen berhasil dicatat!");
        fetchPeriods(); // Refresh data
        // Reset form slightly
        setExtraPay(0);
        setNotes("");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus catatan absen ini?")) return;

    try {
      const res = await fetch(`/api/admin/attendance/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchPeriods();
        setSuccess("Data absen berhasil dihapus.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  const handleClosePeriod = async () => {
    if (!confirm("Tutup Buku sekarang? Sesi gaji semua pekerja akan ditutup dan Anda bisa mulai periode baru esok hari.")) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/attendance/period/close", {
        method: "POST"
      });
      if (res.ok) {
        alert("Buku berhasil ditutup! Total gaji periode ini telah diakumulasi.");
        fetchPeriods();
      } else {
        alert("Gagal menutup buku atau tidak ada absensi aktif.");
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

  // Calculate overall unpaid wages (sum of totalAmount for active periods is 0 because they are not closed yet. Oh wait, activePeriods attendances are accumulated)
  const totalUnpaidWages = attendances.reduce((sum, att) => sum + att.totalPay, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Absensi & Gaji Pekerja</h1>
          <p className={styles.subtitle}>Pantau kehadiran, tambah absen manual, dan tutup buku gaji pekerja.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/attendance/history" className={styles.btnOutlineSecondary}>
            <History size={16} /> Riwayat Tutup Buku
          </Link>
          <button onClick={handleClosePeriod} className={styles.btnOutlineDanger} disabled={attendances.length === 0}>
            <Wallet size={16} /> Tutup Buku Gaji
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Panel Kiri: Form Absen */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Clock size={20} className={styles.iconBlue} /> Input Absen Manual
          </h2>
          
          <form onSubmit={handleCheckIn} className={styles.form}>
            {error && <div className={styles.errorBox}><AlertCircle size={16}/> {error}</div>}
            {success && <div className={styles.successBox}><CheckCircle2 size={16}/> {success}</div>}
            
            <div className={styles.formGroup}>
              <label>Pilih Pekerja</label>
              <select value={selectedWorkerId} onChange={handleWorkerChange} className={styles.input} required>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.role}) - {formatRupiah(w.baseWage)}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Pilih Tanggal</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className={styles.input} 
                required 
              />
            </div>

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
                <input type="number" step="0.1" min="0" value={multiplier} onChange={e => setMultiplier(e.target.value)} className={styles.input} />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Gaji Pokok Pekerja</label>
              <input type="number" min="0" value={baseWage} onChange={e => setBaseWage(Number(e.target.value))} className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Tambahan Lembur Ekstra (Rp)</label>
              <input type="number" min="0" value={extraPay} onChange={e => setExtraPay(Number(e.target.value))} className={styles.input} placeholder="Contoh: 50000" />
            </div>

            <div className={styles.formGroup}>
              <label>Catatan (Opsional)</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={styles.input} placeholder="Bongkar muat barang..." />
            </div>

            <div className={styles.summaryBox}>
                <span>Total Gaji Dihitung:</span>
                <strong>{formatRupiah((baseWage * multiplier) + extraPay)}</strong>
              </div>

            <button type="submit" disabled={submitting} className={styles.btnPrimary}>
              {submitting ? <><Loader2 size={16} className={styles.spinner} /> Menyimpan...</> : <><Save size={16} /> Simpan Absensi</>}
            </button>
          </form>
        </div>

        {/* Panel Kanan: Daftar Absen Aktif */}
        <div className={styles.panel}>
          <div className={styles.panelHeaderFlex}>
            <h2 className={styles.panelTitle} style={{ marginBottom: 0 }}>
              <Users size={20} className={styles.iconGreen} /> Riwayat Absen (Periode Berjalan)
            </h2>
            <div className={styles.badgeBlue}>
              Tagihan: {formatRupiah(totalUnpaidWages)}
            </div>
          </div>
          
          {attendances.length === 0 ? (
            <div className={styles.emptyState}>
              <CalendarRange size={40} className={styles.emptyIcon} />
              <p>Belum ada absensi di periode berjalan ini.</p>
            </div>
          ) : (
            <div className={styles.listContainer}>
              {attendances.map(att => (
                <div key={att.id} className={styles.listItem}>
                  <div className={styles.listLeft}>
                    <div className={styles.dateBox}>
                      <span className={styles.dateDay}>{new Date(att.date).getDate()}</span>
                      <span className={styles.dateMonth}>
                        {new Date(att.date).toLocaleString('id-ID', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <h4 className={styles.workerName}>{att.workerName} <span className={styles.workerRole}>({att.workerRole})</span></h4>
                      <div className={styles.statusBadge}>{att.status}</div>
                      {att.notes && <p className={styles.itemNotes}>{att.notes}</p>}
                    </div>
                  </div>
                  <div className={styles.listRight}>
                    <span className={styles.payAmount}>+{formatRupiah(att.totalPay)}</span>
                    <button onClick={() => handleDelete(att.id)} className={styles.btnDelete} title="Hapus Absen">
                      <Trash2 size={16} />
                    </button>
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
