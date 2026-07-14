"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Loader2, Wallet, Trash2 } from "lucide-react";
import styles from "../Attendance.module.css";

export default function HistoryClient() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/admin/attendance/history");
        const data = await res.json();
        if (res.ok) {
          setPeriods(data.periods);
        }
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDeletePeriod = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Peringatan: Anda akan menghapus seluruh riwayat absen dan gaji pada periode ini secara permanen. Lanjutkan?")) return;

    try {
      const res = await fetch(`/api/admin/attendance/period/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setPeriods(periods.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus riwayat");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div className={styles.loadingState}><Loader2 className={styles.spinner} /> Memuat riwayat...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Riwayat Buku Gaji</h1>
          <p className={styles.subtitle}>Arsip periode absensi dan penggajian yang telah ditutup.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/attendance" className={styles.btnOutlineSecondary}>
            <ArrowLeft size={16} /> Kembali ke Absen Aktif
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {periods.length === 0 ? (
          <div className={styles.panel}>
            <p className={styles.emptyText}>Belum ada riwayat gaji yang ditutup.</p>
          </div>
        ) : (
          periods.map((period) => (
            <div key={period.id} className={styles.panel} style={{ padding: 0, overflow: 'hidden' }}>
              <div 
                style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: expandedId === period.id ? "#F9FAFB" : "white" }}
                onClick={() => toggleExpand(period.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ background: "#DBEAFE", padding: "0.75rem", borderRadius: "12px", color: "#1D4ED8" }}>
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "#111827" }}>
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </h3>
                    <p style={{ margin: 0, color: "#6B7280", fontSize: "0.9rem" }}>
                      {period.attendances.length} Hari Kerja
                    </p>
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Total Dibayarkan</div>
                    <div style={{ fontSize: "1.25rem", color: "#047857", fontWeight: 700 }}>{formatRupiah(period.totalAmount)}</div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", color: "#9CA3AF" }}>
                    <button 
                      onClick={(e) => handleDeletePeriod(e, period.id)} 
                      className={styles.btnDeleteSm}
                      title="Hapus Riwayat"
                      style={{ padding: "0.5rem" }}
                    >
                      <Trash2 size={20} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {expandedId === period.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  </div>
                </div>
              </div>

              {expandedId === period.id && (
                <div style={{ padding: "1.5rem", borderTop: "1px solid #E5E7EB" }}>
                  <h4 style={{ margin: "0 0 1rem 0", color: "#374151" }}>Rincian Kehadiran</h4>
                  {period.attendances.length === 0 ? (
                    <p className={styles.emptyText} style={{ padding: "1rem 0" }}>Tidak ada data harian di periode ini.</p>
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
                            <th>Catatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {period.attendances.map(att => (
                            <tr key={att.id}>
                              <td>{new Date(att.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td>
                                <span className={styles.badge}>{att.status}</span>
                              </td>
                              <td>{formatRupiah(att.baseWage * att.multiplier)}</td>
                              <td>{att.extraPay > 0 ? formatRupiah(att.extraPay) : '-'}</td>
                              <td className={styles.bold}>{formatRupiah(att.totalPay)}</td>
                              <td style={{ color: "#6B7280", fontSize: "0.9rem" }}>{att.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
