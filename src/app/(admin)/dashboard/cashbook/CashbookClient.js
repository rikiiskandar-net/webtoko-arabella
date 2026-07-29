"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
  Calendar,
  BarChart3,
  Gem,
  Coins,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Building,
  Landmark,
  HandCoins,
  Receipt,
  Scale
} from "lucide-react";
import styles from "./Cashbook.module.css";

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const toLocalDateString = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const toLocalDateTimeString = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}T${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export default function CashbookClient() {
  // Navigation View State
  const [activeView, setActiveView] = useState("cashbook"); // "cashbook" or "assets"

  // Cashbook States
  const [activeTab, setActiveTab] = useState("daily");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    toLocalDateString(new Date())
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cashbook Sort & Filter states
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");

  // Cashbook Form states
  const [formType, setFormType] = useState("income");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(
    toLocalDateTimeString(new Date())
  );

  // Family Assets States
  const [familyAssets, setFamilyAssets] = useState([]);
  const [assetSummary, setAssetSummary] = useState({});
  const [assetLoading, setAssetLoading] = useState(true);
  const [assetModalCategory, setAssetModalCategory] = useState(null); // e.g. "EMAS", "SAPI", "TABUNGAN", "HUTANG", "PIUTANG"
  const [editingAssetItem, setEditingAssetItem] = useState(null);
  const [assetForm, setAssetForm] = useState({
    id: "",
    category: "EMAS",
    name: "",
    quantity: "1",
    unit: "gram",
    amount: "",
    notes: "",
  });
  const [assetSaving, setAssetSaving] = useState(false);

  // Fetch Cashbook Daily entries
  useEffect(() => {
    if (activeTab === "daily" && activeView === "cashbook") fetchDaily();
  }, [activeTab, selectedDate, activeView]);

  // Fetch Cashbook Monthly summary
  useEffect(() => {
    if (activeTab === "monthly" && activeView === "cashbook") fetchMonthly();
  }, [activeTab, selectedMonth, selectedYear, activeView]);

  // Fetch Family Assets
  const fetchFamilyAssets = async () => {
    setAssetLoading(true);
    try {
      const res = await fetch("/api/admin/cashbook/assets");
      if (res.ok) {
        const data = await res.json();
        setFamilyAssets(data.assets || []);
        setAssetSummary(data.summary || {});
      }
    } catch (err) {
      console.error("Error fetching family assets:", err);
    } finally {
      setAssetLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyAssets();
  }, []);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cashbook?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/cashbook/summary?month=${selectedMonth}&year=${selectedYear}`
      );
      if (res.ok) {
        const data = await res.json();
        setMonthlySummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cashbook Handlers
  const openAddModal = () => {
    setEditingEntry(null);
    setFormType("income");
    setFormAmount("");
    setFormDescription("");
    const now = new Date();
    setFormDate(
      `${selectedDate}T${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`
    );
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setFormType(entry.type);
    setFormAmount(String(entry.amount));
    setFormDescription(entry.description);
    setFormDate(toLocalDateTimeString(entry.date));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formAmount || !formDescription) return;
    setSaving(true);
    try {
      const body = {
        type: formType,
        amount: parseInt(formAmount),
        description: formDescription,
        date: formDate,
      };

      let res;
      if (editingEntry) {
        res = await fetch(`/api/admin/cashbook?id=${editingEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/cashbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        setShowModal(false);
        if (activeTab === "daily") fetchDaily();
        else fetchMonthly();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      const res = await fetch(`/api/admin/cashbook?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (activeTab === "daily") fetchDaily();
        else fetchMonthly();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for Daily Cashbook
  const dailyIncome = entries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const dailyExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);
  const dailyBalance = dailyIncome - dailyExpense;

  // Filter & Sort entries
  const filteredEntries = entries
    .filter((e) => {
      if (filterType === "income") return e.type === "income";
      if (filterType === "expense") return e.type === "expense";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "highest") return b.amount - a.amount;
      if (sortBy === "lowest") return a.amount - b.amount;
      return 0;
    });

  // Year options for Monthly tab
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) yearOptions.push(y);

  // Asset Modal & CRUD Handlers
  const openCategoryAssetModal = (categoryKey) => {
    setAssetModalCategory(categoryKey);
    setEditingAssetItem(null);

    let defaultUnit = "unit";
    if (categoryKey === "EMAS") defaultUnit = "gram";
    else if (categoryKey === "SAPI") defaultUnit = "ekor";
    else if (categoryKey === "TABUNGAN" || categoryKey === "HUTANG" || categoryKey === "PIUTANG") defaultUnit = "rupiah";

    setAssetForm({
      id: "",
      category: categoryKey,
      name: "",
      quantity: categoryKey === "TABUNGAN" || categoryKey === "HUTANG" || categoryKey === "PIUTANG" ? "1" : "1",
      unit: defaultUnit,
      amount: "",
      notes: "",
    });
  };

  const openEditAssetItem = (item) => {
    setEditingAssetItem(item);
    setAssetForm({
      id: item.id,
      category: item.category,
      name: item.name,
      quantity: String(item.quantity || 1),
      unit: item.unit || "unit",
      amount: String(item.amount || 0),
      notes: item.notes || "",
    });
  };

  const handleSaveAssetItem = async (e) => {
    if (e) e.preventDefault();
    if (!assetForm.name || !assetForm.amount) return;

    setAssetSaving(true);
    try {
      const isEdit = Boolean(assetForm.id);
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch("/api/admin/cashbook/assets", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assetForm.id || undefined,
          category: assetForm.category || assetModalCategory,
          name: assetForm.name,
          quantity: Number(assetForm.quantity) || 1,
          unit: assetForm.unit || "unit",
          amount: Number(assetForm.amount) || 0,
          notes: assetForm.notes || "",
        }),
      });

      if (res.ok) {
        let defaultUnit = "unit";
        if (assetModalCategory === "EMAS") defaultUnit = "gram";
        else if (assetModalCategory === "SAPI") defaultUnit = "ekor";

        setAssetForm({
          id: "",
          category: assetModalCategory,
          name: "",
          quantity: "1",
          unit: defaultUnit,
          amount: "",
          notes: "",
        });
        setEditingAssetItem(null);
        await fetchFamilyAssets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssetSaving(false);
    }
  };

  const handleDeleteAssetItem = async (id) => {
    if (!confirm("Yakin ingin menghapus item aset ini?")) return;
    try {
      const res = await fetch(`/api/admin/cashbook/assets?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchFamilyAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Assets for active modal category
  const categoryAssetsList = familyAssets.filter(
    (a) => (a.category || "").toUpperCase() === (assetModalCategory || "").toUpperCase()
  );

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 className={styles.title}>
            {activeView === "assets" ? "💎 Portofolio Aset Keluarga" : "📒 Buku Kas"}
          </h2>
        </div>
        {activeView === "assets" && (
          <button
            type="button"
            className={styles.btnBackToCashbook}
            onClick={() => setActiveView("cashbook")}
          >
            <ArrowLeft size={18} /> Kembali ke Buku Kas
          </button>
        )}
      </div>

      {/* Marquee Semangat (Only in Cashbook View) */}
      {activeView === "cashbook" && (
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeContent}>
            ✨ SEMANGAT JUALANNYA ISTRIKU 😘 ✨
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ✨ SEMANGAT JUALANNYA ISTRIKU 😘 ✨
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ✨ SEMANGAT JUALANNYA ISTRIKU 😘 ✨
          </div>
          <div className={styles.marqueeContent} aria-hidden="true">
            ✨ SEMANGAT JUALANNYA ISTRIKU 😘 ✨
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ✨ SEMANGAT JUALANNYA ISTRIKU 😘 ✨
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ✨ SEMANGAT JUALANNYA ISTRIKU 😘 ✨
          </div>
        </div>
      )}

      {/* ===== TOP CARD BANNER: ASET KELUARGA (Only in Cashbook View) ===== */}
      {activeView === "cashbook" && (
        <div
          className={styles.assetBannerCard}
          onClick={() => setActiveView("assets")}
        >
          <div className={styles.assetBannerLeft}>
            <div className={styles.assetBannerIconWrapper}>
              <Gem size={28} className={styles.assetBannerIcon} />
            </div>
            <div>
              <div className={styles.assetBannerBadge}>PORTOFOLIO KEKAYAAN</div>
              <div className={styles.assetBannerTitle}>💎 ASET KELUARGA</div>
              <div className={styles.assetBannerSubtitle}>
                Emas &bull; Sapi &bull; Tabungan &bull; Hutang &bull; Piutang
              </div>
            </div>
          </div>
          <div className={styles.assetBannerRight}>
            <div className={styles.assetBannerNetLabel}>Total Kekayaan Bersih</div>
            <div className={styles.assetBannerNetValue}>
              {formatRp(assetSummary?.netWorth || 0)}
            </div>
            <button type="button" className={styles.assetBannerBtn}>
              Kelola Aset <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: CASHBOOK (HARIAN / BULANAN)                                       */}
      {/* ========================================================================= */}
      {activeView === "cashbook" && (
        <>
          {/* Tab Switcher */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${
                activeTab === "daily" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("daily")}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Calendar size={18} /> Harian
              </div>
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "monthly" ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <BarChart3 size={18} /> Bulanan
              </div>
            </button>
          </div>

          {/* ======================== DAILY TAB ======================== */}
          {activeTab === "daily" && (
            <>
              {/* Summary Cards */}
              <div className={styles.summaryGrid}>
                <div className={`${styles.summaryCard} ${styles.cardIncome}`}>
                  <div className={styles.summaryLabel}>
                    <TrendingUp size={16} /> Pemasukan
                  </div>
                  <div className={styles.summaryValue}>
                    {formatRp(dailyIncome)}
                  </div>
                </div>
                <div className={`${styles.summaryCard} ${styles.cardExpense}`}>
                  <div className={styles.summaryLabel}>
                    <TrendingDown size={16} /> Pengeluaran
                  </div>
                  <div className={styles.summaryValue}>
                    {formatRp(dailyExpense)}
                  </div>
                </div>
                <div className={`${styles.summaryCard} ${styles.cardBalance}`}>
                  <div className={styles.summaryLabel}>
                    <Wallet size={16} /> Saldo Bersih
                  </div>
                  <div className={styles.summaryValue}>
                    {formatRp(dailyBalance)}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className={styles.controlRow}>
                <div className={styles.dateControl}>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className={styles.rightControls}>
                  {/* Filter by Type */}
                  <select
                    className={styles.sortSelect}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Semua Transaksi</option>
                    <option value="income">🟢 Pemasukan</option>
                    <option value="expense">🔴 Pengeluaran</option>
                  </select>

                  {/* Sort by */}
                  <select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">🕒 Terbaru</option>
                    <option value="oldest">⌛ Terlama</option>
                    <option value="highest">💰 Terbesar</option>
                    <option value="lowest">🪙 Terkecil</option>
                  </select>

                  {/* Add Button */}
                  <button className={styles.addBtn} onClick={openAddModal}>
                    <Plus size={18} /> Tambah
                  </button>
                </div>
              </div>

              {/* Entry Table */}
              {loading ? (
                <div className={styles.loadingContainer}>
                  <Loader2 className={styles.spinner} size={32} />
                  <p>Memuat data transaksi...</p>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className={styles.emptyState}>
                  <BookOpen size={48} className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>Belum ada transaksi</p>
                  <p className={styles.emptySubtitle}>
                    {entries.length > 0
                      ? "Tidak ada transaksi yang cocok dengan filter."
                      : "Klik tombol '+ Tambah' untuk mencatat transaksi baru."}
                  </p>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>WAKTU</th>
                        <th>TIPE</th>
                        <th>KETERANGAN</th>
                        <th>NOMINAL</th>
                        <th style={{ textAlign: "right" }}>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {new Date(entry.date).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>
                            <span
                              className={`${styles.typeBadge} ${
                                entry.type === "income"
                                  ? styles.typeIncome
                                  : styles.typeExpense
                              }`}
                            >
                              {entry.type === "income" ? (
                                <>
                                  <ArrowDownCircle size={14} /> Pemasukan
                                </>
                              ) : (
                                <>
                                  <ArrowUpCircle size={14} /> Pengeluaran
                                </>
                              )}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{entry.description}</td>
                          <td>
                            <span
                              className={`${styles.amountText} ${
                                entry.type === "income"
                                  ? styles.amountIncome
                                  : styles.amountExpense
                              }`}
                            >
                              {entry.type === "income" ? "+" : "-"}
                              {formatRp(entry.amount)}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionCell} style={{ justifyContent: "flex-end" }}>
                              <button
                                className={`${styles.iconBtn} ${styles.edit}`}
                                onClick={() => openEditModal(entry)}
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className={`${styles.iconBtn} ${styles.delete}`}
                                onClick={() => handleDelete(entry.id)}
                                title="Hapus"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ======================== MONTHLY TAB ======================== */}
          {activeTab === "monthly" && (
            <>
              {/* Month/Year Selector */}
              <div className={styles.monthSelectorRow}>
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>Bulan</label>
                  <select
                    className={styles.filterSelect}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>Tahun</label>
                  <select
                    className={styles.filterSelect}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className={styles.loadingContainer}>
                  <Loader2 className={styles.spinner} size={32} />
                  <p>Memuat rekap bulanan...</p>
                </div>
              ) : monthlySummary ? (
                <>
                  {/* Monthly Summary Cards */}
                  <div className={styles.summaryGrid}>
                    <div className={`${styles.summaryCard} ${styles.cardIncome}`}>
                      <div className={styles.summaryLabel}>
                        <TrendingUp size={16} /> Total Pemasukan
                      </div>
                      <div className={styles.summaryValue}>
                        {formatRp(monthlySummary.totalIncome)}
                      </div>
                    </div>
                    <div
                      className={`${styles.summaryCard} ${styles.cardExpense}`}
                    >
                      <div className={styles.summaryLabel}>
                        <TrendingDown size={16} /> Total Pengeluaran
                      </div>
                      <div className={styles.summaryValue}>
                        {formatRp(monthlySummary.totalExpense)}
                      </div>
                    </div>
                    <div
                      className={`${styles.summaryCard} ${styles.cardBalance}`}
                    >
                      <div className={styles.summaryLabel}>
                        <Wallet size={16} /> Saldo Bersih Bulanan
                      </div>
                      <div className={styles.summaryValue}>
                        {formatRp(monthlySummary.netBalance)}
                      </div>
                    </div>
                  </div>

                  {/* Daily breakdown list */}
                  <div className={styles.monthlyListHeader}>
                    <h3 className={styles.monthlyListTitle}>
                      Rincian Per Hari — {MONTHS[selectedMonth - 1]} {selectedYear}
                    </h3>
                  </div>

                  {monthlySummary.days.length === 0 ? (
                    <div className={styles.emptyState}>
                      <BookOpen size={48} className={styles.emptyIcon} />
                      <p className={styles.emptyTitle}>
                        Belum ada transaksi di bulan ini
                      </p>
                    </div>
                  ) : (
                    <div className={styles.monthlyDaysList}>
                      {monthlySummary.days.map((day) => (
                        <div key={day.date} className={styles.monthlyDayCard}>
                          <div className={styles.monthlyDayDate}>
                            {new Date(day.date).toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </div>
                          <div className={styles.monthlyDayRight}>
                            <span className={styles.monthlyDayIncome}>
                              +{formatRp(day.income)}
                            </span>
                            <span className={styles.monthlyDayExpense}>
                              -{formatRp(day.expense)}
                            </span>
                            <span className={styles.monthlyDayNet}>
                              {formatRp(day.net)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FAMILY ASSETS (HALAMAN ASET KELUARGA)                             */}
      {/* ========================================================================= */}
      {activeView === "assets" && (
        <div className={styles.assetsPageContainer}>

          {/* Hero Net Worth Header Card */}
          <div className={styles.assetNetWorthHero}>
            <div className={styles.heroNetHeader}>
              <div className={styles.heroNetBadge}>
                <ShieldCheck size={16} /> ESTIMASI PORTOFOLIO KEUANGAN
              </div>
              <h3 className={styles.heroNetTitle}>Total Kekayaan Bersih Keluarga</h3>
              <p className={styles.heroNetFormula}>
                Formula: (Emas + Sapi + Tabungan + Piutang) &minus; Hutang Kita
              </p>
            </div>
            <div className={styles.heroNetAmount}>
              {formatRp(assetSummary?.netWorth || 0)}
            </div>
          </div>

          {/* 5 Category Cards Grid */}
          <div className={styles.assetCategoryGrid}>

            {/* 1. PERHIASAN EMAS */}
            <div
              className={`${styles.assetCategoryCard} ${styles.cardEmas}`}
              onClick={() => openCategoryAssetModal("EMAS")}
            >
              <div className={styles.catCardTop}>
                <div className={styles.catCardIconBg}>
                  <Gem size={26} color="#F59E0B" />
                </div>
                <span className={styles.catCardBadge}>KATEGORI ASET</span>
              </div>
              <h4 className={styles.catCardTitle}>💎 Perhiasan Emas</h4>
              <div className={styles.catCardQty}>
                {assetSummary?.totalEmasGram || 0} Gram
              </div>
              <div className={styles.catCardValue}>
                {formatRp(assetSummary?.totalEmasRp || 0)}
              </div>
              <div className={styles.catCardFooter}>
                <span>Kelola & Detail</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* 2. TERNAK SAPI */}
            <div
              className={`${styles.assetCategoryCard} ${styles.cardSapi}`}
              onClick={() => openCategoryAssetModal("SAPI")}
            >
              <div className={styles.catCardTop}>
                <div className={styles.catCardIconBg}>
                  <Building size={26} color="#10B981" />
                </div>
                <span className={styles.catCardBadge}>KATEGORI TERNAK</span>
              </div>
              <h4 className={styles.catCardTitle}>🐄 Ternak Sapi</h4>
              <div className={styles.catCardQty}>
                {assetSummary?.totalSapiEkor || 0} Ekor
              </div>
              <div className={styles.catCardValue}>
                {formatRp(assetSummary?.totalSapiRp || 0)}
              </div>
              <div className={styles.catCardFooter}>
                <span>Kelola & Detail</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* 3. TABUNGAN & SIMPANAN */}
            <div
              className={`${styles.assetCategoryCard} ${styles.cardTabungan}`}
              onClick={() => openCategoryAssetModal("TABUNGAN")}
            >
              <div className={styles.catCardTop}>
                <div className={styles.catCardIconBg}>
                  <Landmark size={26} color="#3B82F6" />
                </div>
                <span className={styles.catCardBadge}>KATEGORI SIMPANAN</span>
              </div>
              <h4 className={styles.catCardTitle}>🏦 Tabungan & Bank</h4>
              <div className={styles.catCardQty}>Tabungan Bank / Cash</div>
              <div className={styles.catCardValue}>
                {formatRp(assetSummary?.totalTabungan || 0)}
              </div>
              <div className={styles.catCardFooter}>
                <span>Kelola & Detail</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* 4. HUTANG KITA */}
            <div
              className={`${styles.assetCategoryCard} ${styles.cardHutang}`}
              onClick={() => openCategoryAssetModal("HUTANG")}
            >
              <div className={styles.catCardTop}>
                <div className={styles.catCardIconBg}>
                  <Receipt size={26} color="#EF4444" />
                </div>
                <span className={styles.catCardBadgeDanger}>KEWAJIBAN / UTANG</span>
              </div>
              <h4 className={styles.catCardTitle}>💸 Hutang Kita</h4>
              <div className={styles.catCardQty}>Mengurangi Kekayaan</div>
              <div className={styles.catCardValueDanger}>
                {formatRp(assetSummary?.totalHutang || 0)}
              </div>
              <div className={styles.catCardFooter}>
                <span>Kelola & Detail</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* 5. PIUTANG (HUTANG ORANG) */}
            <div
              className={`${styles.assetCategoryCard} ${styles.cardPiutang}`}
              onClick={() => openCategoryAssetModal("PIUTANG")}
            >
              <div className={styles.catCardTop}>
                <div className={styles.catCardIconBg}>
                  <HandCoins size={26} color="#8B5CF6" />
                </div>
                <span className={styles.catCardBadge}>TAGIHAN PIUTANG</span>
              </div>
              <h4 className={styles.catCardTitle}>💰 Piutang (Hutang Orang)</h4>
              <div className={styles.catCardQty}>Orang Utang Ke Kita</div>
              <div className={styles.catCardValue}>
                {formatRp(assetSummary?.totalPiutang || 0)}
              </div>
              <div className={styles.catCardFooter}>
                <span>Kelola & Detail</span>
                <ChevronRight size={16} />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT CASHBOOK TRANSACTION                                  */}
      {/* ========================================================================= */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingEntry ? "Edit Transaksi" : "Tambah Transaksi Baru"}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Type Switcher */}
              <div className={styles.formTypeSwitch}>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${
                    formType === "income" ? styles.typeIncomeActive : ""
                  }`}
                  onClick={() => setFormType("income")}
                >
                  🟢 Pemasukan
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${
                    formType === "expense" ? styles.typeExpenseActive : ""
                  }`}
                  onClick={() => setFormType("expense")}
                >
                  🔴 Pengeluaran
                </button>
              </div>

              {/* Amount */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nominal (Rp)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="Misal: 50000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Keterangan</label>

                {/* Preset Chips */}
                <div className={styles.presetChips}>
                  {(formType === "income"
                    ? [
                        "Jualan Nasi Goreng",
                        "Jualan Arabella",
                        "Transfer Masuk",
                        "Bonus / Tip",
                      ]
                    : [
                        "Belanja Bahan Baku",
                        "Beli Gas / Listrik",
                        "Gaji Karyawan",
                        "Operasional Pasar",
                      ]
                  ).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className={styles.chip}
                      onClick={() => setFormDescription(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Misal: Jualan Nasi Goreng malam ini"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tanggal & Jam</label>
                <input
                  type="datetime-local"
                  className={styles.formInput}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                className={styles.btnPrimaryModal}
                onClick={handleSave}
                disabled={saving || !formAmount || !formDescription}
              >
                {saving ? (
                  <Loader2 className={styles.spinner} size={18} />
                ) : (
                  "Simpan Transaksi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CATEGORY DETAIL & CRUD FOR FAMILY ASSETS                         */}
      {/* ========================================================================= */}
      {assetModalCategory && (
        <div
          className={styles.modalOverlay}
          onClick={() => setAssetModalCategory(null)}
        >
          <div
            className={`${styles.modalContent} ${styles.modalContentLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {assetModalCategory === "EMAS" && <Gem size={24} color="#F59E0B" />}
                {assetModalCategory === "SAPI" && <Building size={24} color="#10B981" />}
                {assetModalCategory === "TABUNGAN" && <Landmark size={24} color="#3B82F6" />}
                {assetModalCategory === "HUTANG" && <Receipt size={24} color="#EF4444" />}
                {assetModalCategory === "PIUTANG" && <HandCoins size={24} color="#8B5CF6" />}
                <h3 className={styles.modalTitle}>
                  Kelola Detail:{" "}
                  {assetModalCategory === "EMAS"
                    ? "Perhiasan Emas"
                    : assetModalCategory === "SAPI"
                    ? "Ternak Sapi"
                    : assetModalCategory === "TABUNGAN"
                    ? "Tabungan & Simpanan Bank"
                    : assetModalCategory === "HUTANG"
                    ? "Hutang Kita (Kewajiban)"
                    : "Piutang (Hutang Orang)"}
                </h3>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setAssetModalCategory(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Existing Items Table / List */}
              <div className={styles.assetItemListHeader}>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
                  Daftar Item ({categoryAssetsList.length})
                </h4>
              </div>

              {categoryAssetsList.length === 0 ? (
                <div className={styles.emptyAssetList}>
                  Belum ada catatan {assetModalCategory.toLowerCase()} tersimpan.
                  Isi form di bawah untuk menambah.
                </div>
              ) : (
                <div className={styles.assetItemList}>
                  {categoryAssetsList.map((item) => (
                    <div key={item.id} className={styles.assetItemRow}>
                      <div className={styles.assetItemLeft}>
                        <div className={styles.assetItemName}>{item.name}</div>
                        <div className={styles.assetItemMeta}>
                          {assetModalCategory === "EMAS" || assetModalCategory === "SAPI"
                            ? `${item.quantity} ${item.unit || "unit"} @ ${formatRp(item.amount)}`
                            : item.notes || "Tanpa catatan"}
                        </div>
                      </div>
                      <div className={styles.assetItemRight}>
                        <div className={styles.assetItemTotal}>
                          {formatRp((item.amount || 0) * (item.quantity || 1))}
                        </div>
                        <div className={styles.entryActions}>
                          <button
                            type="button"
                            className={styles.btnIcon}
                            onClick={() => openEditAssetItem(item)}
                            title="Edit Item"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.btnIcon} ${styles.btnDelete}`}
                            onClick={() => handleDeleteAssetItem(item.id)}
                            title="Hapus Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Input Item Barunya */}
              <form onSubmit={handleSaveAssetItem} className={styles.assetInputForm}>
                <h4 style={{ margin: "16px 0 10px 0", fontSize: "0.95rem", fontWeight: 800, color: "var(--foreground)" }}>
                  {editingAssetItem ? "✏️ Edit Item" : "➕ Tambah Item Baru"}
                </h4>

                <div className={styles.assetFormGrid}>
                  {/* Nama Item */}
                  <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                    <label className={styles.formLabel}>Nama Item / Deskripsi</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder={
                        assetModalCategory === "EMAS"
                          ? "Misal: Kalung Emas 24K, Cincin Kawin"
                          : assetModalCategory === "SAPI"
                          ? "Misal: Sapi Limosin Jantan, Sapi Betina 2"
                          : assetModalCategory === "TABUNGAN"
                          ? "Misal: Tabungan Bank BCA, Deposito"
                          : assetModalCategory === "HUTANG"
                          ? "Misal: Utang KPR Bank, Pinjaman Usaha"
                          : "Misal: Piutang Pak Budi, Utang Mas Dimas"
                      }
                      value={assetForm.name}
                      onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Quantity (Except Tabungan/Hutang/Piutang usually 1) */}
                  {(assetModalCategory === "EMAS" || assetModalCategory === "SAPI") && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        {assetModalCategory === "EMAS" ? "Jumlah Gram" : "Jumlah Ekor"}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        className={styles.formInput}
                        value={assetForm.quantity}
                        onChange={(e) => setAssetForm({ ...assetForm, quantity: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {/* Nominal (Rp) */}
                  <div className={styles.formGroup} style={assetModalCategory !== "EMAS" && assetModalCategory !== "SAPI" ? { gridColumn: "span 2" } : {}}>
                    <label className={styles.formLabel}>
                      {assetModalCategory === "EMAS" || assetModalCategory === "SAPI"
                        ? "Harga per Unit/Gram (Rp)"
                        : "Nominal Rupiah (Rp)"}
                    </label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="Misal: 1300000"
                      value={assetForm.amount}
                      onChange={(e) => setAssetForm({ ...assetForm, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.modalFooter} style={{ padding: 0, marginTop: "16px" }}>
                  {editingAssetItem && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => {
                        setEditingAssetItem(null);
                        setAssetForm({ id: "", category: assetModalCategory, name: "", quantity: "1", unit: assetModalCategory === "EMAS" ? "gram" : assetModalCategory === "SAPI" ? "ekor" : "unit", amount: "", notes: "" });
                      }}
                    >
                      Batal Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className={styles.btnPrimaryModal}
                    disabled={assetSaving || !assetForm.name || !assetForm.amount}
                  >
                    {assetSaving ? (
                      <Loader2 className={styles.spinner} size={18} />
                    ) : editingAssetItem ? (
                      "Update Item Aset"
                    ) : (
                      "➕ Tambah Item Aset"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
