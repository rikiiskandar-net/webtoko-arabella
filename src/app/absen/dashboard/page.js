"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Timer, WarningCircle, FloppyDisk, SignOut, CheckCircle,
  ListDashes, Warning, CaretDown, CaretUp,
  User, Phone, MapPin, Briefcase, FileText, Package, Trash, House,
  BookOpenText, TrendUp, UserCircle, Spinner, SealCheck,
  CheckSquareOffset
, Lightning, CloudSun, Pill, Receipt, XCircle, Coffee, Gear , HandWaving, CalendarBlank, Tag, Money, Notepad, BookBookmark, Archive, Coins, Eye, EyeClosed, Info } from "@phosphor-icons/react";
import Link from "next/link";
import styles from "./Dashboard.module.css";

export default function WorkerDashboard() {
  const router = useRouter();

  // Data State
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [historyTab, setHistoryTab] = useState("active");
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [expandedArchiveId, setExpandedArchiveId] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", type: "warning", onConfirm: null });
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [showBalances, setShowBalances] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("absenku_show_balances");
    if (savedState !== null) {
      setShowBalances(savedState === "true");
    }
  }, []);

  const toggleBalances = () => {
    const newVal = !showBalances;
    setShowBalances(newVal);
    localStorage.setItem("absenku_show_balances", newVal.toString());
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
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "", role: "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileViewMode, setProfileViewMode] = useState("info");
  const [settingsForm, setSettingsForm] = useState({ email: "", password: "", passwordConfirm: "" });
  const [settingsSubmitting, setSettingsSubmitting] = useState(false);
  const [wageForm, setWageForm] = useState({ baseWage: 100000 });
  const [wageSubmitting, setWageSubmitting] = useState(false);

  const formatRupiah = (number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };



  const fetchData = async () => {
    try {
      const [meRes, attendRes] = await Promise.all([
        fetch(`/api/worker/auth/me?t=${Date.now()}`),
        fetch(`/api/worker/attendance?t=${Date.now()}`)
      ]);
      if (!meRes.ok) { router.replace("/absen"); return; }
      const meData = await meRes.json();
      setUser(meData.user);
      setProfileForm({
        name: meData.user.name || "",
        phone: meData.user.phone || "",
        address: meData.user.address || "",
        role: meData.user.role || ""
      });
      setSettingsForm(prev => ({ ...prev, email: meData.user.email || "" }));
      setWageForm({ baseWage: meData.user.baseWage || 100000 });
      if (attendRes.ok) {
        const attData = await attendRes.json();
        setData(attData);
        if (attData.defaultWage) setBaseWage(attData.defaultWage);
      }
    } catch {
      router.replace("/absen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const splashTimer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(splashTimer);
  }, []);

  // Status config
  const STATUS_OPTIONS = [
    { value: "Kerja Normal",   emoji: <CheckCircle weight="fill" size={24} color="#059669" />, label: "Kerja Normal",  mult: "1x Gaji",   multiplierVal: 1,   activeClass: styles.statusPillNormalActive },
    { value: "Kerja 1.5 Hari", emoji: <Timer weight="fill" size={24} color="#2563EB" />,       label: "Kerja 1.5 Hari",mult: "1.5x",      multiplierVal: 1.5, activeClass: styles.statusPill15Active },
    { value: "Kerja Lembur",   emoji: <Lightning weight="fill" size={24} color="#7C3AED" />,   label: "Kerja Lembur",  mult: "2x Gaji",   multiplierVal: 2,   activeClass: styles.statusPillLemburActive },
    { value: "Setengah Hari",  emoji: <CloudSun weight="fill" size={24} color="#D97706" />,    label: "Setengah Hari", mult: "0.5x Gaji", multiplierVal: 0.5, activeClass: styles.statusPillSetengahActive },
    { value: "Libur",          emoji: <Coffee weight="fill" size={24} color="#6B7280" />,      label: "Libur",         mult: "0x Gaji",   multiplierVal: 0,   activeClass: styles.statusPillLiburActive },
    { value: "Custom",         emoji: <Gear weight="fill" size={24} color="#4B5563" />,        label: "Custom",        mult: "Atur Sendiri", multiplierVal: 1,   activeClass: styles.statusPillCustomActive },
  ];

  const handleStatusSelect = (opt) => {
    setStatus(opt.value);
    setMultiplier(opt.multiplierVal);
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
      const result = await res.json();
      if (res.ok) {
        showToast("Absensi berhasil disimpan! 🎉");
        setNotes("");
        setExtraPay(0);
        setSelectedDate(getLocalToday());
        await fetchData();
      } else {
        showToast(result.error || "Gagal menyimpan absensi", "error");
      }
    } catch {
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
        setProfileViewMode("info");
        showToast("Profil berhasil disimpan! ✨");
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal menyimpan profil", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    if (settingsForm.password && settingsForm.password !== settingsForm.passwordConfirm) {
      showToast("Konfirmasi password tidak cocok", "error");
      return;
    }
    setSettingsSubmitting(true);
    try {
      const res = await fetch("/api/worker/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: settingsForm.email, password: settingsForm.password })
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        setProfileViewMode("info");
        setSettingsForm(prev => ({ ...prev, password: "", passwordConfirm: "" }));
        showToast("Pengaturan akun berhasil disimpan! 🔐");
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal menyimpan pengaturan", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSettingsSubmitting(false);
    }
  };

  const handleWageSave = async (e) => {
    e.preventDefault();
    setWageSubmitting(true);
    try {
      const res = await fetch("/api/worker/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseWage: wageForm.baseWage })
      });
      if (res.ok) {
        const result = await res.json();
        setUser(result.user);
        setBaseWage(result.user.baseWage || 100000); // Sync to attendance form
        setProfileViewMode("info");
        showToast("Gaji Harian berhasil diatur! 💰");
      } else {
        const errData = await res.json();
        showToast(errData.error || "Gagal mengatur gaji", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setWageSubmitting(false);
    }
  };

  const handleDeleteAttendance = (attId) => {
    setModalConfig({
      isOpen: true, type: "warning",
      title: "Hapus Absensi?",
      message: "Data absensi ini akan dihapus permanen dan tidak bisa dikembalikan.",
      onConfirm: async () => {
        setModalConfig(m => ({ ...m, isOpen: false }));
        try {
          const res = await fetch(`/api/worker/attendance?id=${attId}`, { method: "DELETE" });
          if (res.ok) { showToast("Absensi dihapus."); await fetchData(); }
          else { const d = await res.json(); showToast(d.error || "Gagal menghapus absensi", "error"); }
        } catch { showToast("Terjadi kesalahan", "error"); }
      }
    });
  };

  const handleDeleteArchive = (periodId) => {
    setModalConfig({
      isOpen: true, type: "warning",
      title: "Hapus Arsip Gajian?",
      message: "Seluruh data pada periode ini akan dihapus permanen.",
      onConfirm: async () => {
        setModalConfig(m => ({ ...m, isOpen: false }));
        try {
          const res = await fetch(`/api/worker/attendance/period?id=${periodId}`, { method: "DELETE" });
          if (res.ok) { showToast("Arsip dihapus."); await fetchData(); }
          else { const d = await res.json(); showToast(d.error || "Gagal menghapus arsip", "error"); }
        } catch { showToast("Terjadi kesalahan", "error"); }
      }
    });
  };

  const handleCloseBook = () => {
    setModalConfig({
      isOpen: true, type: "warning",
      title: "Tutup Buku & Gajian?",
      message: "Periode aktif akan ditutup dan dipindah ke Arsip Gajian. Pastikan semua absensi sudah benar.",
      onConfirm: async () => {
        setModalConfig(m => ({ ...m, isOpen: false }));
        try {
          const res = await fetch("/api/worker/attendance/period/close", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ periodId: data?.activePeriod?.id })
          });
          if (res.ok) { showToast("Buku ditutup! Selamat gajian 🎉"); await fetchData(); }
          else { const d = await res.json(); showToast(d.error || "Gagal menutup buku", "error"); }
        } catch { showToast("Terjadi kesalahan", "error"); }
      }
    });
  };

  const handleLogout = () => {
    setModalConfig({
      isOpen: true, type: "warning",
      title: "Keluar dari Akun?",
      message: "Anda akan keluar dari aplikasi ABSENKU.",
      onConfirm: async () => {
        setModalConfig(m => ({ ...m, isOpen: false }));
        await fetch("/api/worker/auth/logout", { method: "POST" });
        router.replace("/absen");
      }
    });
  };

  const toggleCard = (id) => setExpandedCardId(expandedCardId === id ? null : id);
  const toggleArchive = (id) => setExpandedArchiveId(expandedArchiveId === id ? null : id);

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'Kerja Normal':   return { cls: styles.badgeNormal,   emoji: <CheckCircle size={14} weight="fill" />, label: 'Kerja Normal' };
      case 'Kerja 1.5 Hari': return { cls: styles.badge15Hari,   emoji: <Timer size={14} weight="fill" />, label: 'Kerja 1.5 Hari' };
      case 'Kerja Lembur':   return { cls: styles.badgeLembur,   emoji: <Lightning size={14} weight="fill" />, label: 'Kerja Lembur' };
      case 'Setengah Hari':  return { cls: styles.badgeSetengah, emoji: <CloudSun size={14} weight="fill" />, label: 'Setengah Hari' };
      case 'Libur':          return { cls: styles.badgeLibur,    emoji: <Coffee size={14} weight="fill" />, label: 'Libur' };
      case 'Custom':         return { cls: styles.badgeCustom,   emoji: <Gear size={14} weight="fill" />, label: 'Custom' };
      case 'Sakit':          return { cls: styles.badgeSakit,    emoji: <Pill size={14} weight="fill" />, label: 'Sakit' };
      case 'Izin':           return { cls: styles.badgeIzin,     emoji: <ListDashes size={14} weight="fill" />, label: 'Izin' };
      case 'Absen':          return { cls: styles.badgeAbsen,    emoji: <XCircle size={14} weight="fill" />, label: 'Absen' };
      default:               return { cls: styles.badgeNormal,   emoji: <CheckCircle size={14} weight="fill" />, label: statusVal };
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const renderAttendanceCard = (att, isActiveBook = false) => {
    const isExpanded = expandedCardId === att.id;
    const badge = getStatusBadge(att.status);
    return (
      <div className={`${styles.historyCardWrapper} ${isExpanded ? styles.historyCardWrapperActive : ''}`} key={att.id}>
        <div className={styles.historyCardHeader} onClick={() => toggleCard(att.id)}>
          <div className={styles.historyLeft}>
            <span className={styles.historyDate}>
              {new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className={`${styles.historyBadge} ${badge.cls}`}>
              {badge.emoji} {badge.label}
            </span>
          </div>
          <div className={styles.historyRight}>
            <span className={styles.historyPay}>{showBalances ? formatRupiah(att.totalPay) : 'Rp •••••'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {isActiveBook && (
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); handleDeleteAttendance(att.id); }}
                  title="Hapus Absen"
                >
                  <Trash size={16} weight="fill" />
                </button>
              )}
              {isExpanded ? <CaretUp size={16} color="#94a3b8" weight="fill" /> : <CaretDown size={16} color="#94a3b8" weight="fill" />}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={styles.historyCardBody}>
            <div className={styles.historyDetailRow}>
              <span>Upah Dasar</span>
              <span>{showBalances ? formatRupiah(att.baseWage) : 'Rp •••••'}</span>
            </div>
            <div className={styles.historyDetailRow}>
              <span>Multiplier</span>
              <span>x{att.multiplier}</span>
            </div>
            {att.extraPay > 0 && (
              <div className={styles.historyDetailRow}>
                <span>Tambahan</span>
                <span>{showBalances ? formatRupiah(att.extraPay) : 'Rp •••••'}</span>
              </div>
            )}
            {att.notes && (
              <div className={styles.historyDetailNotes}>
                <span className={styles.notesLabel}>Catatan</span>
                <span className={styles.notesText}>{att.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ===== SKELETON LOADING =====
  if (loading || showSplash) {
    return (
      <div className={styles.skeletonWrapper}>
        <div className={styles.skeletonTopBar}>
          <div className={`${styles.skeleton} ${styles.skeletonAvatar}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonIcon}`}></div>
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonPremiumCard}`}></div>
        <div className={styles.skeletonMiniGrid}>
          <div className={`${styles.skeleton} ${styles.skeletonMiniCard}`}></div>
          <div className={`${styles.skeleton} ${styles.skeletonMiniCard}`}></div>
        </div>
        <div className={styles.panel} style={{ boxShadow: 'none', border: '1.5px solid #E8EEFF' }}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeletonFormGroup}>
              <div className={`${styles.skeleton} ${styles.skeletonLabel}`}></div>
              <div className={`${styles.skeleton} ${styles.skeletonInputBox}`}></div>
            </div>
          ))}
          <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
        </div>
      </div>
    );
  }

  const periodPay = data?.activeAttendances?.reduce((sum, item) => sum + item.totalPay, 0) || 0;
  const currentTotal = Math.round(Number(baseWage) * Number(multiplier)) + Number(extraPay);
  const totalHarian = data?.activeAttendances?.reduce((sum, item) => sum + (Number(item.multiplier) || 0), 0) || 0;
  const todayStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      {/* Toast */}
      {toast.visible && (
        <div className={styles.toastContainer}>
          <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}>
            {toast.type === 'error' ? <WarningCircle size={18} weight="fill" /> : <SealCheck size={18} weight="fill" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalConfig.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={`${styles.modalIcon} ${modalConfig.type === 'success' ? styles.modalIconSuccess : styles.modalIconWarning}`}>
              {modalConfig.type === 'success' ? <CheckCircle size={32} weight="fill" /> : <Warning size={32} weight="fill" />}
            </div>
            <h3 className={styles.modalTitle}>{modalConfig.title}</h3>
            <p className={styles.modalMessage}>{modalConfig.message}</p>
            <div className={styles.modalActions}>
              {modalConfig.type !== 'success' && (
                <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                  Batal
                </button>
              )}
              <button
                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                style={modalConfig.type === 'success' ? { background: 'linear-gradient(135deg, #10b981, #059669)', flex: 1 } : {}}
                onClick={modalConfig.onConfirm}
              >
                {modalConfig.type === 'success' ? "Tutup" : "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== TOP HEADER ===== */}
      <header className={styles.topHeader}>
        <div className={styles.headerLogo}>
          <div className={styles.headerLogoIcon}>
            <BookOpenText size={20} color="white" weight="fill" />
          </div>
          <div>
            <span className={styles.headerLogoText}>ABSENKU</span>
            <span className={styles.headerLogoSub}>by Dapur Arabella</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Link href="/portfolio" title="Developer Portfolio" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            color: '#4B5563',
            marginRight: '8px',
            textDecoration: 'none'
          }}>
            <Info size={20} weight="bold" />
          </Link>
          <span className={styles.headerDateBadge}>
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* =================== TAB: HOME =================== */}
          {activeTab === "home" && (
            <div className={styles.tabContentWrapper}>

              {/* Greeting */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6366F1', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  <HandWaving size={16} weight="fill" style={{ marginRight: "4px", verticalAlign: "-2px" }} /> Selamat Datang
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: '4px 0 2px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                  Hai, {user?.name?.split(' ')[0] || 'Pekerja'}!
                </h1>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>{todayStr}</div>
              </div>

              {/* Hero Card */}
              <div className={styles.heroCard}>
                <div className={styles.heroTopRow}>
                  <div>
                    <span className={styles.heroLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Buku Gaji Aktif
                      <button onClick={toggleBalances} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        {showBalances ? <Eye size={16} /> : <EyeClosed size={16} />}
                      </button>
                    </span>
                    <div className={styles.heroName}>{user?.name || 'Pekerja'}</div>
                  </div>
                  <span className={styles.heroWageBadge}>
                    {showBalances ? formatRupiah(baseWage) : 'Rp •••••'}/hari
                  </span>
                </div>
                <div className={styles.heroAmount}>
                  <span className={styles.heroCurrency}>Rp</span>
                  {showBalances ? periodPay.toLocaleString('id-ID') : '••••••••'}
                </div>
                <span className={styles.heroSubtext}>
                  Mulai: {data?.activePeriod
                    ? new Date(data.activePeriod.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Belum ada periode aktif'}
                </span>
              </div>

              {/* Mini Stats */}
              <div className={styles.miniStatsGrid}>
                <div className={styles.miniCard + ' ' + styles.miniCardGreen}>
                  <div className={styles.miniCardIcon}>
                    <CheckSquareOffset size={20} weight="fill" />
                  </div>
                  <div className={styles.miniCardValue}>{totalHarian}</div>
                  <div className={styles.miniCardLabel}>Total Harian</div>
                </div>
                <div className={styles.miniCard + ' ' + styles.miniCardOrange}>
                  <div className={styles.miniCardIcon}>
                    <TrendUp size={20} weight="fill" />
                  </div>
                  <div className={styles.miniCardValue} style={{ fontSize: '1rem' }}>
                    {showBalances ? formatRupiah(currentTotal).replace('Rp\u00a0', 'Rp') : 'Rp •••••'}
                  </div>
                  <div className={styles.miniCardLabel}>Estimasi Hari Ini</div>
                </div>
              </div>

              {/* Form Kehadiran */}
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <Timer size={22} weight="fill" className={styles.iconBlue} />
                  Catat Kehadiran
                </h2>

                <form className={styles.form} onSubmit={handleCheckIn}>
                  {/* Tanggal */}
                  <div className={styles.formGroup}>
                    <label><CalendarBlank size={16} weight="fill" style={{ marginRight: "6px", verticalAlign: "-3px", color: "var(--primary)" }} /> Pilih Tanggal</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Status Pill Selector */}
                  <div className={styles.formGroup}>
                    <label><Tag size={16} weight="fill" style={{ marginRight: "6px", verticalAlign: "-3px", color: "var(--primary)" }} /> Status Kehadiran</label>
                    <div className={styles.statusSelectorGrid}>
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`${styles.statusPill} ${status === opt.value ? opt.activeClass : ''}`}
                          onClick={() => handleStatusSelect(opt)}
                        >
                          <span className={styles.statusPillEmoji}>{opt.emoji}</span>
                          <span className={styles.statusPillText}>
                            <span className={styles.statusPillName}>{opt.label}</span>
                            <span className={styles.statusPillMult}>{opt.mult}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gaji Pokok */}
                  <div className={styles.formGroup}>
                    <label><Money size={16} weight="fill" style={{ marginRight: "6px", verticalAlign: "-3px", color: "var(--primary)" }} /> Gaji Pokok (Rp)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={baseWage}
                      onChange={(e) => setBaseWage(e.target.value)}
                      min="0"
                      required
                    />
                  </div>

                  {/* Tambahan Lembur */}
                  <div className={styles.formGroup}>
                    <label><Lightning size={16} weight="fill" style={{ marginRight: "6px", verticalAlign: "-3px", color: "var(--primary)" }} /> Bonus/Tambahan (Rp)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={extraPay}
                      onChange={(e) => setExtraPay(e.target.value)}
                      min="0"
                    />
                  </div>

                  {/* Catatan */}
                  <div className={styles.formGroup}>
                    <label><Notepad size={16} weight="fill" style={{ marginRight: "6px", verticalAlign: "-3px", color: "var(--primary)" }} /> Catatan (Opsional)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Misal: Lembur bongkar muat..."
                    />
                  </div>

                  {/* Summary */}
                  <div className={styles.summaryBox}>
                    Total Gaji Hari Ini
                    <strong>{showBalances ? formatRupiah(currentTotal) : 'Rp ••••••••'}</strong>
                  </div>

                  <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                    {submitting ? <Spinner size={20} className={styles.spinner} weight="fill" /> : <FloppyDisk size={20} weight="fill" />}
                    Simpan Absensi
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* =================== TAB: HISTORY =================== */}
          {activeTab === "history" && (
            <div className={styles.tabContentWrapper}>
              <div style={{ marginBottom: '16px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                  Riwayat Absensi
                </h1>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Kelola dan pantau absensi Anda</div>
              </div>

              <div className={styles.tabSwitcher}>
                <button
                  className={`${styles.tabSwitchBtn} ${historyTab === 'active' ? styles.tabSwitchBtnActive : ''}`}
                  onClick={() => setHistoryTab('active')}
                >
                  <BookBookmark size={18} weight="fill" style={{ marginRight: "6px", verticalAlign: "-4px" }} /> Buku Aktif
                </button>
                <button
                  className={`${styles.tabSwitchBtn} ${historyTab === 'archive' ? styles.tabSwitchBtnActive : ''}`}
                  onClick={() => setHistoryTab('archive')}
                >
                  <Archive size={18} weight="fill" style={{ marginRight: "6px", verticalAlign: "-4px" }} /> Arsip Gajian
                </button>
              </div>

              {/* Buku Aktif */}
              {historyTab === "active" && (
                <div className={styles.tabContentWrapper}>
                  <button className={styles.btnCloseBook} onClick={handleCloseBook} style={{ marginBottom: '12px' }}>
                    <Coins size={22} weight="fill" style={{ marginRight: "8px", verticalAlign: "-5px" }} /> Tutup Buku & Gajian Sekarang
                  </button>
                  <div className={styles.panel}>
                    <h3 className={styles.listTitle}>Riwayat Berjalan ({data?.activeAttendances?.length || 0} data)</h3>
                    {data?.activeAttendances?.length === 0 ? (
                      <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyStateIcon}><Package size={36} weight="fill" /></div>
                        <span className={styles.emptyStateText}>Buku absen Anda masih kosong.</span>
                      </div>
                    ) : (
                      <div className={styles.historyList}>
                        {data?.activeAttendances?.map(att => renderAttendanceCard(att, true))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Arsip */}
              {historyTab === "archive" && (
                <div className={`${styles.panel} ${styles.tabContentWrapper}`}>
                  <h3 className={styles.listTitle}>Riwayat Faktur Gaji</h3>
                  {data?.closedPeriods?.length === 0 ? (
                    <div className={styles.emptyStateContainer}>
                      <div className={styles.emptyStateIcon}><FileText size={36} weight="fill" /></div>
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
                                <FileText size={18} weight="fill" color="#6366F1" />
                                {startDateStr} – {endDateStr}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={styles.archiveTotal}>{showBalances ? formatRupiah(periodTotal) : 'Rp •••••'}</span>
                                <button
                                  className={styles.deleteBtn}
                                  onClick={(e) => { e.stopPropagation(); handleDeleteArchive(period.id); }}
                                  title="Hapus Arsip"
                                >
                                  <Trash size={16} weight="fill" />
                                </button>
                                {isExpanded ? <CaretUp size={16} color="#94a3b8" weight="fill" /> : <CaretDown size={16} color="#94a3b8" weight="fill" />}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className={styles.archiveBody}>
                                {period.attendances.length === 0 ? (
                                  <p className={styles.emptyText}>Tidak ada data di periode ini.</p>
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
          )}

          {/* =================== TAB: PROFILE =================== */}
          {activeTab === "profile" && (
            <div className={styles.tabContentWrapper}>
              {/* Profile Hero */}
              {profileViewMode === "info" && (
                <>
                  <div className={styles.profileHero2026}>
                    <div className={styles.profileAvatarContainer2026}>
                      <div className={styles.profileAvatarInner2026}>
                        <img src="/worker-avatar.png" alt="Avatar Pekerja" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                    <div className={styles.profileName2026}>{user?.name || 'Nama Pekerja'}</div>
                    <div className={styles.profileRole2026}>{user?.role || 'Pekerja'}</div>
                    
                    <button onClick={() => setProfileViewMode('wage')} className={styles.btnWagePill}>
                      <Money size={16} weight="fill" /> Atur Gaji Harian
                    </button>
                  </div>

                  <div className={styles.profileList2026}>
                    <div className={styles.profileItem2026}>
                      <div className={`${styles.profileItemIcon2026} ${styles.bgBlue}`}>
                        <User size={20} weight="fill" />
                      </div>
                      <div className={styles.profileItemText2026}>
                        <div className={styles.profileItemLabel2026}>Nama Lengkap</div>
                        <div className={styles.profileItemValue2026}>{user?.name || '-'}</div>
                      </div>
                    </div>
                    
                    <div className={styles.profileItem2026}>
                      <div className={`${styles.profileItemIcon2026} ${styles.bgPurple}`}>
                        <Briefcase size={20} weight="fill" />
                      </div>
                      <div className={styles.profileItemText2026}>
                        <div className={styles.profileItemLabel2026}>Jabatan</div>
                        <div className={styles.profileItemValue2026}>{user?.role || '-'}</div>
                      </div>
                    </div>
                    
                    <div className={styles.profileItem2026}>
                      <div className={`${styles.profileItemIcon2026} ${styles.bgOrange}`}>
                        <Phone size={20} weight="fill" />
                      </div>
                      <div className={styles.profileItemText2026}>
                        <div className={styles.profileItemLabel2026}>No. HP</div>
                        <div className={styles.profileItemValue2026}>{user?.phone || '-'}</div>
                      </div>
                    </div>
                    
                    <div className={styles.profileItem2026}>
                      <div className={`${styles.profileItemIcon2026} ${styles.bgGreen}`}>
                        <MapPin size={20} weight="fill" />
                      </div>
                      <div className={styles.profileItemText2026}>
                        <div className={styles.profileItemLabel2026}>Alamat</div>
                        <div className={styles.profileItemValue2026}>{user?.address || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.actionRow2026}>
                    <button className={styles.btnPrimary2026} onClick={() => setProfileViewMode("edit")}>
                      <User size={20} weight="fill" /> Edit Profil
                    </button>
                    <button className={styles.btnSecondary2026} onClick={() => setProfileViewMode("settings")}>
                      <Gear size={20} weight="fill" /> Setting Keamanan
                    </button>
                    <button className={styles.btnDanger2026} onClick={handleLogout}>
                      <SignOut size={20} weight="fill" /> Keluar dari Akun
                    </button>
                  </div>
                </>
              )}

              {profileViewMode === "edit" && (
                <div className={styles.panel2026}>
                  <h2 className={styles.panelTitle2026}>
                    <UserCircle size={24} weight="fill" className={styles.iconBlue} />
                    Edit Profil
                  </h2>
                  <form onSubmit={handleProfileSave}>
                    <div className={styles.formGroup2026}>
                      <label>Nama Lengkap</label>
                      <input type="text" className={styles.input2026} value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Nama pekerja" />
                    </div>
                    <div className={styles.formGroup2026}>
                      <label>Nomor HP / WA</label>
                      <input type="tel" className={styles.input2026} value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="08123456789" />
                    </div>
                    <div className={styles.formGroup2026}>
                      <label>Jabatan</label>
                      <input type="text" className={styles.input2026} value={profileForm.role}
                        onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                        placeholder="Misal: Mandor, Tukang, Kenek" />
                    </div>
                    <div className={styles.formGroup2026}>
                      <label>Alamat Domisili</label>
                      <textarea className={styles.input2026} value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        placeholder="Alamat lengkap (opsional)"
                        style={{ minHeight: '100px', resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                      <button type="button" className={styles.btnSecondary2026} style={{ flex: 1 }} onClick={() => setProfileViewMode("info")}>
                        Batal
                      </button>
                      <button type="submit" className={styles.btnPrimary2026} style={{ flex: 1 }} disabled={profileSubmitting}>
                        {profileSubmitting ? <Spinner size={20} className={styles.spinner} weight="fill" /> : <FloppyDisk size={20} weight="fill" />} Simpan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {profileViewMode === "settings" && (
                <div className={styles.panel2026}>
                  <h2 className={styles.panelTitle2026}>
                    <Gear size={24} weight="fill" className={styles.iconBlue} />
                    Setting Keamanan
                  </h2>
                  <form onSubmit={handleSettingsSave}>
                    <div className={styles.formGroup2026}>
                      <label>Email Login</label>
                      <input type="email" className={styles.input2026} value={settingsForm.email} onChange={e => setSettingsForm({...settingsForm, email: e.target.value})} required />
                    </div>
                    <div className={styles.formGroup2026}>
                      <label>Password Baru <span style={{ textTransform: 'none', fontWeight: 'normal', color: '#94a3b8' }}>(kosongkan jika tidak diubah)</span></label>
                      <input type="password" className={styles.input2026} value={settingsForm.password} onChange={e => setSettingsForm({...settingsForm, password: e.target.value})} placeholder="******" />
                    </div>
                    {settingsForm.password && (
                      <div className={styles.formGroup2026}>
                        <label>Konfirmasi Password Baru</label>
                        <input type="password" className={styles.input2026} value={settingsForm.passwordConfirm} onChange={e => setSettingsForm({...settingsForm, passwordConfirm: e.target.value})} placeholder="******" required />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                      <button type="button" className={styles.btnSecondary2026} style={{ flex: 1 }} onClick={() => setProfileViewMode("info")}>
                        Batal
                      </button>
                      <button type="submit" className={styles.btnPrimary2026} style={{ flex: 1 }} disabled={settingsSubmitting}>
                        {settingsSubmitting ? <Spinner size={20} className={styles.spinner} weight="fill" /> : <FloppyDisk size={20} weight="fill" />} Simpan
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {profileViewMode === "wage" && (
                <div className={styles.panel2026}>
                  <h2 className={styles.panelTitle2026}>
                    <Money size={24} weight="fill" className={styles.iconBlue} />
                    Atur Gaji Harian
                  </h2>
                  <form onSubmit={handleWageSave}>
                    <div className={styles.formGroup2026}>
                      <label>Standar Gaji Harian (Rp)</label>
                      <input type="number" className={styles.input2026} value={wageForm.baseWage} onChange={e => setWageForm({...wageForm, baseWage: e.target.value})} required min="0" />
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>Nominal ini akan menjadi angka bawaan (default) saat Anda mengisi absen harian.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                      <button type="button" className={styles.btnSecondary2026} style={{ flex: 1 }} onClick={() => setProfileViewMode("info")}>
                        Batal
                      </button>
                      <button type="submit" className={styles.btnPrimary2026} style={{ flex: 1 }} disabled={wageSubmitting}>
                        {wageSubmitting ? <Spinner size={20} className={styles.spinner} weight="fill" /> : <FloppyDisk size={20} weight="fill" />} Simpan
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <nav className={styles.bottomNav}>
        <button
          className={`${styles.navItem} ${activeTab === 'home' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <div className={styles.navIconBg}>
            <House size={22} weight={activeTab === 'home' ? 'fill' : 'regular'} className={styles.navIcon} />
          </div>
          <span>Beranda</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'history' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <div className={styles.navIconBg}>
            <ListDashes size={22} weight={activeTab === 'history' ? 'fill' : 'regular'} className={styles.navIcon} />
          </div>
          <span>Riwayat</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <div className={styles.navIconBg}>
            <UserCircle size={22} weight={activeTab === 'profile' ? 'fill' : 'regular'} className={styles.navIcon} />
          </div>
          <span>Profil</span>
        </button>
      </nav>
    </>
  );
}
