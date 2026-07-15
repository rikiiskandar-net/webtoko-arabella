"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, Wallet, CalendarRange, AlertCircle, Loader2, Save, LogOut, 
  CheckCircle2, Home, History, AlertTriangle, ChevronDown, ChevronUp, Droplet,
  HardHat, User, Phone, MapPin, Briefcase, FileText, Frown, PackageOpen, Trash2
} from "lucide-react";
import styles from "./Dashboard.module.css";

export default function WorkerDashboard() {
  const router = useRouter();
  
  // Data State
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("home"); // 'home', 'history', or 'profile'
  const [historyTab, setHistoryTab] = useState("active"); // 'active' or 'archive'
  
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [expandedArchiveId, setExpandedArchiveId] = useState(null);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "warning", onConfirm: null });

  // Toast State (UI/UX Polish)
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 3000);
  };

  // Form State (Absen)
  const [submitting, setSubmitting] = useState(false);
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

  // Form State (Profile)
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    role: ""
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  useEffect(() => {
    fetchData();
    // Hide splash screen after 1.5 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(splashTimer);
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
      setProfileForm({
        name: userData.user.name || "",
        phone: userData.user.phone || "",
        address: userData.user.address || "",
        role: userData.user.role || ""
      });

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

  const handleLogout = () => {
    setModalConfig({
      isOpen: true,
      type: "warning",
      title: "Keluar Aplikasi",
      message: "Anda yakin ingin keluar dari aplikasi absen?",
      onConfirm: async () => {
        setModalConfig({ ...modalConfig, isOpen: false });
        await fetch("/api/worker/auth/logout", { method: "POST" });
        router.push("/absen");
      }
    });
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
        showToast("Berhasil absen hari ini!", "success");
        setNotes("");
        setExtraPay(0);
        fetchData();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal menyimpan absensi", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSubmitting(true);

    try {
      const res = await fetch("/api/worker/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });

      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        setModalConfig({
          isOpen: true,
          type: "success",
          title: "Profil Diperbarui",
          message: "Data profil Anda berhasil disimpan secara aman.",
          onConfirm: () => {
            setModalConfig({ ...modalConfig, isOpen: false });
          }
        });
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal menyimpan profil", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleDeleteArchive = (periodId) => {
    setModalConfig({
      isOpen: true,
      type: "warning",
      title: "Hapus Arsip Gajian",
      message: "Apakah Anda yakin ingin menghapus arsip gaji ini? Seluruh data absen di dalamnya akan hilang permanen.",
      onConfirm: async () => {
        setModalConfig({ ...modalConfig, isOpen: false });
        try {
          const res = await fetch(`/api/worker/attendance/period?id=${periodId}`, {
            method: "DELETE"
          });
          if (res.ok) {
            showToast("Arsip gajian berhasil dihapus", "success");
            fetchData();
          } else {
            const errData = await res.json();
            showToast(errData.error || "Gagal menghapus arsip", "error");
          }
        } catch (err) {
          showToast("Terjadi kesalahan jaringan", "error");
        }
      }
    });
  };

  const handleCloseBook = () => {
    setModalConfig({
      isOpen: true,
      type: "warning",
      title: "Tutup Buku",
      message: "Tutup buku dan mulai perhitungan gaji baru? Perhitungan sebelumnya akan disimpan ke dalam riwayat Arsip.",
      onConfirm: async () => {
        setModalConfig({ ...modalConfig, isOpen: false });
        try {
          const res = await fetch("/api/worker/attendance/period/close", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ periodId: data?.activePeriod?.id })
          });
          if (res.ok) {
            setModalConfig({
              isOpen: true,
              type: "success",
              title: "Berhasil",
              message: "Buku gaji berhasil ditutup! Riwayat tagihan dapat dilihat di tab Arsip Gajian.",
              onConfirm: () => {
                setModalConfig({ ...modalConfig, isOpen: false });
                fetchData();
                setHistoryTab("archive"); // Auto switch to archive tab to show the closed period
              }
            });
          } else {
            const errData = await res.json();
            showToast(errData.error || "Gagal menutup buku", "error");
          }
        } catch (err) {
          showToast("Terjadi kesalahan jaringan", "error");
        }
      }
    });
  };

  const toggleCard = (id) => {
    if (expandedCardId === id) setExpandedCardId(null);
    else setExpandedCardId(id);
  };

  const toggleArchive = (id) => {
    if (expandedArchiveId === id) setExpandedArchiveId(null);
    else setExpandedArchiveId(id);
  };

  // Helper to render individual attendance card
  const renderAttendanceCard = (att) => {
    const isExpanded = expandedCardId === att.id;
    return (
      <div className={`${styles.historyCardWrapper} ${isExpanded ? styles.historyCardWrapperActive : ''}`} key={att.id}>
        <div className={styles.historyCardHeader} onClick={() => toggleCard(att.id)}>
          <div className={styles.historyLeft}>
            <span className={styles.historyDate}>
              {new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className={styles.historyBadge}>{att.status}</span>
          </div>
          <div className={styles.historyRight}>
            <span className={styles.historyPay}>{formatRupiah(att.totalPay)}</span>
            {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
          </div>
        </div>
        
        {isExpanded && (
          <div className={styles.expandedDetails}>
            <div className={styles.detailRow}>
              <span>Gaji Pokok</span>
              <span>{formatRupiah(Math.round(att.totalPay - (att.extraPay || 0)))}</span>
            </div>
            {att.extraPay > 0 && (
              <div className={styles.detailRow}>
                <span>Lembur Ekstra</span>
                <span>{formatRupiah(att.extraPay)}</span>
              </div>
            )}
            {att.notes && (
              <div className={styles.detailRow}>
                <span>Catatan</span>
                <span style={{textAlign: 'right'}}>{att.notes}</span>
              </div>
            )}
            <div className={styles.detailTotal}>
              <span>Total Hari Ini</span>
              <span>{formatRupiah(att.totalPay)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };


  if (loading || showSplash) {
    return (
      <div className={styles.splashScreen}>
        <div className={styles.splashLogo}>
          <Droplet size={64} color="#60a5fa" />
          <div style={{textAlign: 'center'}}>
            <div className={styles.splashTitle}>Arabella</div>
            <div className={styles.splashSubtitle}>Worker App</div>
          </div>
        </div>
      </div>
    );
  }

  const periodPay = data?.activeAttendances?.reduce((sum, item) => sum + item.totalPay, 0) || 0;
  const currentTotal = Math.round(Number(baseWage) * Number(multiplier)) + Number(extraPay);

  return (
    <div className={styles.container}>

      {/* Floating Toast UI */}
      {toast.visible && (
        <div className={styles.toastContainer}>
          <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      {modalConfig.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalIcon} ${modalConfig.type === 'success' ? styles.modalIconSuccess : styles.modalIconWarning}`}>
              {modalConfig.type === 'success' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
            </div>
            <h3 className={styles.modalTitle}>{modalConfig.title}</h3>
            <p className={styles.modalMessage}>{modalConfig.message}</p>
            <div className={styles.modalActions}>
              {modalConfig.type === 'warning' && (
                <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setModalConfig({...modalConfig, isOpen: false})}>
                  Batal
                </button>
              )}
              <button className={`${styles.modalBtn} ${styles.modalBtnConfirm}`} style={modalConfig.type === 'success' ? {background: '#10b981', flex: 1} : {}} onClick={modalConfig.onConfirm}>
                {modalConfig.type === 'success' ? "Tutup" : "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Halo, {user?.name}</h1>
          <p className={styles.subtitle}>Catat kehadiran dan kelola gaji harian Anda.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.wageBadge}>
            <Wallet size={18} />
            {formatRupiah(baseWage)}/hr
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Keluar">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        
        {/* TAB: HOME / FORM */}
        {activeTab === "home" && (
          <div className={styles.tabContentWrapper}>
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
            </div>

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
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === "history" && (
          <div className={styles.tabContentWrapper}>
            <div className={styles.panel} style={{background: 'transparent', boxShadow: 'none', padding: '0'}}>
              
              {/* History Tab Switcher */}
              <div className={styles.tabSwitcher}>
                <button 
                  className={`${styles.tabSwitchBtn} ${historyTab === 'active' ? styles.tabSwitchBtnActive : ''}`}
                  onClick={() => setHistoryTab('active')}
                >
                  Buku Aktif
                </button>
                <button 
                  className={`${styles.tabSwitchBtn} ${historyTab === 'archive' ? styles.tabSwitchBtnActive : ''}`}
                  onClick={() => setHistoryTab('archive')}
                >
                  Arsip Gajian
                </button>
              </div>

              {/* Content: Active Book */}
              {historyTab === "active" && (
                <div className={styles.tabContentWrapper}>
                  <button className={styles.btnCloseBook} onClick={handleCloseBook} style={{marginBottom: '1rem'}}>
                    Tutup Buku & Gajian Sekarang
                  </button>

                  <div className={styles.panel}>
                    <h3 className={styles.listTitle}>Riwayat Berjalan</h3>
                    
                    {data?.activeAttendances?.length === 0 ? (
                      <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyStateIcon}>
                          <PackageOpen size={36} />
                        </div>
                        <span className={styles.emptyStateText}>Buku absen Anda masih kosong.</span>
                      </div>
                    ) : (
                      <div className={styles.historyList}>
                        {data?.activeAttendances?.map(renderAttendanceCard)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content: Archive Book */}
              {historyTab === "archive" && (
                <div className={`${styles.panel} ${styles.tabContentWrapper}`}>
                  <h3 className={styles.listTitle}>Riwayat Faktur Gaji</h3>
                  
                  {data?.closedPeriods?.length === 0 ? (
                    <div className={styles.emptyStateContainer}>
                      <div className={styles.emptyStateIcon}>
                        <FileText size={36} />
                      </div>
                      <span className={styles.emptyStateText}>Belum ada riwayat gaji yang ditutup.</span>
                    </div>
                  ) : (
                    <div>
                      {data?.closedPeriods?.map((period) => {
                        const isExpanded = expandedArchiveId === period.id;
                        const startDateStr = new Date(period.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                        const endDateStr = period.endDate ? new Date(period.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Selesai';
                        
                        const periodTotal = period.attendances.reduce((sum, att) => sum + att.totalPay, 0);

                        return (
                          <div key={period.id} className={styles.archiveCard}>
                            <div 
                              className={`${styles.archiveHeader} ${isExpanded ? styles.archiveHeaderActive : ''}`}
                              onClick={() => toggleArchive(period.id)}
                            >
                              <div className={styles.archiveTitle}>
                                <FileText size={18} color="#64748b" />
                                {startDateStr} - {endDateStr}
                              </div>
                              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                                <span className={styles.archiveTotal}>{formatRupiah(periodTotal)}</span>
                                <button 
                                  className={styles.deleteBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteArchive(period.id);
                                  }}
                                  title="Hapus Arsip"
                                  style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Trash2 size={18} />
                                </button>
                                {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className={styles.archiveBody}>
                                {period.attendances.length === 0 ? (
                                  <p className={styles.emptyText} style={{margin: 0}}>Tidak ada data absensi di periode ini.</p>
                                ) : (
                                  <div className={styles.historyList}>
                                    {period.attendances.map(renderAttendanceCard)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === "profile" && (
          <div className={styles.tabContentWrapper}>
            <div className={styles.panel}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem'}}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem', boxShadow: '0 4px 20px rgba(56, 189, 248, 0.3)'
                }}>
                  <HardHat size={40} color="#0284c7" />
                </div>
                <h2 className={styles.panelTitle} style={{margin: 0}}>Profil Pekerja</h2>
                <p className={styles.subtitle} style={{textAlign: 'center', marginTop: '0.25rem'}}>Lengkapi identitas opsional Anda</p>
              </div>
              
              <form className={styles.form} onSubmit={handleProfileSave}>
                <div className={styles.formGroup}>
                  <label><User size={14} style={{display:'inline', marginRight: '4px', verticalAlign: '-2px'}}/> Nama Lengkap</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    placeholder="Nama pekerja"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label><Phone size={14} style={{display:'inline', marginRight: '4px', verticalAlign: '-2px'}}/> Nomor HP / WA</label>
                  <input 
                    type="tel" 
                    className={styles.input} 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="08123456789 (Opsional)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label><Briefcase size={14} style={{display:'inline', marginRight: '4px', verticalAlign: '-2px'}}/> Jabatan (Role)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({...profileForm, role: e.target.value})}
                    placeholder="Misal: Mandor, Tukang, Kenek (Opsional)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label><MapPin size={14} style={{display:'inline', marginRight: '4px', verticalAlign: '-2px'}}/> Alamat Domisili</label>
                  <textarea 
                    className={styles.input} 
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    placeholder="Alamat lengkap (Opsional)"
                    style={{minHeight: '80px', resize: 'vertical'}}
                  />
                </div>

                <button type="submit" className={styles.btnPrimary} style={{marginTop: '0.5rem'}} disabled={profileSubmitting}>
                  {profileSubmitting ? <Loader2 size={20} className={styles.spinner} /> : <Save size={20} />}
                  Simpan Profil
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${activeTab === 'home' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} className={styles.navIcon} />
          <span>Beranda</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'history' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={24} className={styles.navIcon} />
          <span>Riwayat</span>
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <HardHat size={24} className={styles.navIcon} />
          <span>Profil</span>
        </button>
      </nav>
    </div>
  );
}
