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
  Scale,
  PlusCircle,
  Check
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
  const [assetViewMode, setAssetViewMode] = useState("overview"); // "overview" (5 Grid Cards) or "category_detail" (Full Table)
  const [selectedCategory, setSelectedCategory] = useState("EMAS"); // "EMAS", "SAPI", "TABUNGAN", "HUTANG", "PIUTANG"

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

  // Asset Category Detail Handlers
  const openCategoryDetailView = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setAssetViewMode("category_detail");
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
    // Smooth scroll to top form
    window.scrollTo({ top: 200, behavior: "smooth" });
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
          category: selectedCategory,
          name: assetForm.name,
          quantity: Number(assetForm.quantity) || 1,
          unit: assetForm.unit || "unit",
          amount: Number(assetForm.amount) || 0,
          notes: assetForm.notes || "",
        }),
      });

      if (res.ok) {
        let defaultUnit = "unit";
        if (selectedCategory === "EMAS") defaultUnit = "gram";
        else if (selectedCategory === "SAPI") defaultUnit = "ekor";

        setAssetForm({
          id: "",
          category: selectedCategory,
          name: "",
          quantity: selectedCategory === "TABUNGAN" || selectedCategory === "HUTANG" || selectedCategory === "PIUTANG" ? "1" : "1",
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
        if (editingAssetItem?.id === id) {
          setEditingAssetItem(null);
        }
        await fetchFamilyAssets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Assets for active category
  const categoryAssetsList = familyAssets.filter(
    (a) => (a.category || "").toUpperCase() === (selectedCategory || "").toUpperCase()
  );

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 className={styles.title}>
            {activeView === "assets"
              ? assetViewMode === "category_detail"
                ? `💎 Detail Kategori: ${
                    selectedCategory === "EMAS"
                      ? "Perhiasan Emas"
                      : selectedCategory === "SAPI"
                      ? "Ternak Sapi"
                      : selectedCategory === "TABUNGAN"
                      ? "Tabungan Bank"
                      : selectedCategory === "HUTANG"
                      ? "Hutang Kita"
                      : "Piutang Orang"
                  }`
                : "💎 Portofolio Aset Keluarga"
              : "📒 Buku Kas"}
          </h2>
        </div>

        {activeView === "assets" && (
          <div>
            {assetViewMode === "category_detail" ? (
              <button
                type="button"
                className={styles.btnBackToCashbook}
                onClick={() => setAssetViewMode("overview")}
              >
                <ArrowLeft size={18} /> Kembali ke Portofolio Aset
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnBackToCashbook}
                onClick={() => setActiveView("cashbook")}
              >
                <ArrowLeft size={18} /> Kembali ke Buku Kas
              </button>
            )}
          </div>
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
          onClick={() => {
            setActiveView("assets");
            setAssetViewMode("overview");
          }}
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
            <div className={styles.assetBannerNetLabel}>Total Aset Keluarga</div>
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
                            <div
                              className={styles.actionCell}
                              style={{ justifyContent: "flex-end" }}
                            >
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
              <div className={styles.monthSelectorRow} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className={styles.selectGroup} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label className={styles.selectLabel} style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--foreground)" }}>Bulan:</label>
                  <select
                    className={styles.sortSelect}
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
                <div className={styles.selectGroup} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label className={styles.selectLabel} style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--foreground)" }}>Tahun:</label>
                  <select
                    className={styles.sortSelect}
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

                  {/* Daily breakdown table */}
                  <div className={styles.monthlyListHeader} style={{ margin: "1.5rem 0 1rem 0" }}>
                    <h3 className={styles.monthlyListTitle} style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)" }}>
                      📊 Rekap Rincian Transaksi Per Hari — {MONTHS[selectedMonth - 1]} {selectedYear}
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
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>TANGGAL</th>
                            <th>PEMASUKAN</th>
                            <th>PENGELUARAN</th>
                            <th style={{ textAlign: "right" }}>SALDO BERSIH</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlySummary.days.map((day) => (
                            <tr key={day.date}>
                              <td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                                {new Date(day.date).toLocaleDateString("id-ID", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </td>
                              <td>
                                <span className={`${styles.amountText} ${styles.amountIncome}`}>
                                  +{formatRp(day.income)}
                                </span>
                              </td>
                              <td>
                                <span className={`${styles.amountText} ${styles.amountExpense}`}>
                                  -{formatRp(day.expense)}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <span
                                  className={`${styles.amountText} ${
                                    day.net >= 0 ? styles.amountIncome : styles.amountExpense
                                  }`}
                                  style={{ fontWeight: 800 }}
                                >
                                  {formatRp(day.net)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FAMILY ASSETS (OVERVIEW OR FULL-TABLE CATEGORY DETAIL)             */}
      {/* ========================================================================= */}
      {activeView === "assets" && (
        <div className={styles.assetsPageContainer}>

          {/* ===== SUB-MODE A: OVERVIEW GRID (5 CATEGORY CARDS) ===== */}
          {assetViewMode === "overview" && (
            <>
              {/* Hero Net Worth Header Card */}
              <div className={styles.assetNetWorthHero}>
                <div className={styles.heroNetHeader}>
                  <div className={styles.heroNetBadge}>
                    <ShieldCheck size={16} /> ESTIMASI PORTOFOLIO KEUANGAN
                  </div>
                  <h3 className={styles.heroNetTitle}>
                    Total Aset Keluarga
                  </h3>
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
                  onClick={() => openCategoryDetailView("EMAS")}
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
                    <span>Buka Halaman Data Tabel</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* 2. TERNAK SAPI */}
                <div
                  className={`${styles.assetCategoryCard} ${styles.cardSapi}`}
                  onClick={() => openCategoryDetailView("SAPI")}
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
                    <span>Buka Halaman Data Tabel</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* 3. TABUNGAN & SIMPANAN */}
                <div
                  className={`${styles.assetCategoryCard} ${styles.cardTabungan}`}
                  onClick={() => openCategoryDetailView("TABUNGAN")}
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
                    <span>Buka Halaman Data Tabel</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* 4. HUTANG KITA */}
                <div
                  className={`${styles.assetCategoryCard} ${styles.cardHutang}`}
                  onClick={() => openCategoryDetailView("HUTANG")}
                >
                  <div className={styles.catCardTop}>
                    <div className={styles.catCardIconBg}>
                      <Receipt size={26} color="#EF4444" />
                    </div>
                    <span className={styles.catCardBadgeDanger}>
                      KEWAJIBAN / UTANG
                    </span>
                  </div>
                  <h4 className={styles.catCardTitle}>💸 Hutang Kita</h4>
                  <div className={styles.catCardQty}>Mengurangi Kekayaan</div>
                  <div className={styles.catCardValueDanger}>
                    {formatRp(assetSummary?.totalHutang || 0)}
                  </div>
                  <div className={styles.catCardFooter}>
                    <span>Buka Halaman Data Tabel</span>
                    <ChevronRight size={16} />
                  </div>
                </div>

                {/* 5. PIUTANG (HUTANG ORANG) */}
                <div
                  className={`${styles.assetCategoryCard} ${styles.cardPiutang}`}
                  onClick={() => openCategoryDetailView("PIUTANG")}
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
                    <span>Buka Halaman Data Tabel</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== SUB-MODE B: FULL-TABLE CATEGORY DETAIL VIEW (NO MODAL POP-UP!) ===== */}
          {assetViewMode === "category_detail" && (
            <div className={styles.categoryDetailFullPage}>

              {/* Category Summary Hero Banner */}
              <div className={styles.assetCategorySummaryCard}>
                <div className={styles.catHeroLeft}>
                  <div className={styles.catHeroIconBg}>
                    {selectedCategory === "EMAS" && <Gem size={32} color="#F59E0B" />}
                    {selectedCategory === "SAPI" && <Building size={32} color="#10B981" />}
                    {selectedCategory === "TABUNGAN" && <Landmark size={32} color="#3B82F6" />}
                    {selectedCategory === "HUTANG" && <Receipt size={32} color="#EF4444" />}
                    {selectedCategory === "PIUTANG" && <HandCoins size={32} color="#8B5CF6" />}
                  </div>
                  <div>
                    <div className={styles.catHeroBadge}>KATEGORI ASET</div>
                    <h3 className={styles.catHeroTitle}>
                      {selectedCategory === "EMAS"
                        ? "💎 Perhiasan Emas"
                        : selectedCategory === "SAPI"
                        ? "🐄 Ternak Sapi"
                        : selectedCategory === "TABUNGAN"
                        ? "🏦 Tabungan & Bank"
                        : selectedCategory === "HUTANG"
                        ? "💸 Hutang Kita (Kewajiban)"
                        : "💰 Piutang (Hutang Orang Ke Kita)"}
                    </h3>
                    <div className={styles.catHeroSubtitle}>
                      {selectedCategory === "EMAS"
                        ? `Total Berat: ${assetSummary?.totalEmasGram || 0} Gram`
                        : selectedCategory === "SAPI"
                        ? `Total Jumlah: ${assetSummary?.totalSapiEkor || 0} Ekor`
                        : `Total Item: ${categoryAssetsList.length} Item`}
                    </div>
                  </div>
                </div>
                <div className={styles.catHeroRight}>
                  <div className={styles.catHeroValueLabel}>Total Estimasi Nilai</div>
                  <div
                    className={
                      selectedCategory === "HUTANG"
                        ? styles.catHeroValueDanger
                        : styles.catHeroValue
                    }
                  >
                    {formatRp(
                      selectedCategory === "EMAS"
                        ? assetSummary?.totalEmasRp
                        : selectedCategory === "SAPI"
                        ? assetSummary?.totalSapiRp
                        : selectedCategory === "TABUNGAN"
                        ? assetSummary?.totalTabungan
                        : selectedCategory === "HUTANG"
                        ? assetSummary?.totalHutang
                        : assetSummary?.totalPiutang
                    )}
                  </div>
                </div>
              </div>

              {/* Top Form Box (Selalu Siap di Atas Tabel) */}
              <div className={styles.assetFormBoxTop}>
                <div className={styles.assetFormBoxHeader}>
                  <h4 className={styles.assetFormBoxTitle}>
                    {editingAssetItem ? "✏️ Edit Item Aset" : "➕ Tambah Item Aset Baru"}
                  </h4>
                  {editingAssetItem && (
                    <button
                      type="button"
                      className={styles.btnCancelEdit}
                      onClick={() => {
                        setEditingAssetItem(null);
                        let defaultUnit = "unit";
                        if (selectedCategory === "EMAS") defaultUnit = "gram";
                        else if (selectedCategory === "SAPI") defaultUnit = "ekor";
                        setAssetForm({
                          id: "",
                          category: selectedCategory,
                          name: "",
                          quantity: selectedCategory === "TABUNGAN" || selectedCategory === "HUTANG" || selectedCategory === "PIUTANG" ? "1" : "1",
                          unit: defaultUnit,
                          amount: "",
                          notes: "",
                        });
                      }}
                    >
                      <X size={14} /> Batal Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveAssetItem} className={styles.assetFormGridRow}>
                  {/* Nama Item */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nama Item / Deskripsi</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder={
                        selectedCategory === "EMAS"
                          ? "Misal: Kalung Emas 24K, Cincin Kawin"
                          : selectedCategory === "SAPI"
                          ? "Misal: Sapi Limosin Jantan 1"
                          : selectedCategory === "TABUNGAN"
                          ? "Misal: Tabungan BCA, Deposito Bank"
                          : selectedCategory === "HUTANG"
                          ? "Misal: Utang KPR Bank, Pinjaman Usaha"
                          : "Misal: Piutang Pak Budi"
                      }
                      value={assetForm.name}
                      onChange={(e) =>
                        setAssetForm({ ...assetForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Quantity & Unit */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {selectedCategory === "EMAS"
                        ? "Berat & Satuan"
                        : selectedCategory === "SAPI"
                        ? "Jumlah (Ekor)"
                        : "Jumlah (Unit)"}
                    </label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className={styles.formInput}
                        value={assetForm.quantity}
                        onChange={(e) =>
                          setAssetForm({ ...assetForm, quantity: e.target.value })
                        }
                        required
                      />
                      {selectedCategory === "EMAS" && (
                        <select
                          className={styles.sortSelect}
                          style={{ minWidth: "95px", padding: "0.65rem 0.5rem" }}
                          value={assetForm.unit || "gram"}
                          onChange={(e) =>
                            setAssetForm({ ...assetForm, unit: e.target.value })
                          }
                        >
                          <option value="gram">Gram (g)</option>
                          <option value="mg">Milligram (mg)</option>
                          <option value="mili">Mili</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Nominal (Rp) */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {selectedCategory === "EMAS"
                        ? "Harga Langsung / Total Nilai (Rp)"
                        : selectedCategory === "SAPI"
                        ? "Harga per Ekor (Rp)"
                        : "Nominal Rupiah (Rp)"}
                    </label>
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder={selectedCategory === "EMAS" ? "Misal: 6500000" : "Misal: 1300000"}
                      value={assetForm.amount}
                      onChange={(e) =>
                        setAssetForm({ ...assetForm, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className={styles.formGroupBtn}>
                    <button
                      type="submit"
                      className={styles.btnPrimarySubmit}
                      disabled={assetSaving || !assetForm.name || !assetForm.amount}
                    >
                      {assetSaving ? (
                        <Loader2 className={styles.spinner} size={18} />
                      ) : editingAssetItem ? (
                        <>
                          <Check size={18} /> Simpan Perubahan
                        </>
                      ) : (
                        <>
                          <PlusCircle size={18} /> Tambah Ke Tabel
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Full Table Data Aset */}
              <div className={styles.assetTableCard}>
                <div className={styles.tableCardHeader}>
                  <h4 className={styles.tableCardTitle}>
                    📊 Tabel Data Aset ({categoryAssetsList.length} Item)
                  </h4>
                </div>

                {assetLoading ? (
                  <div className={styles.loadingContainer}>
                    <Loader2 className={styles.spinner} size={32} />
                    <p>Memuat data tabel aset...</p>
                  </div>
                ) : categoryAssetsList.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Gem size={48} className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>Tabel Masih Kosong</p>
                    <p className={styles.emptySubtitle}>
                      Gunakan form di atas untuk menambahkan catatan item aset pertama Anda.
                    </p>
                  </div>
                ) : (
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>NAMA ITEM</th>
                          <th>JUMLAH / SATUAN</th>
                          <th>HARGA PER UNIT</th>
                          <th>TOTAL NILAI (RP)</th>
                          <th style={{ textAlign: "right" }}>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryAssetsList.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 700 }}>{item.name}</td>
                            <td>
                              <span className={styles.typeBadge} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3B82F6", borderColor: "rgba(59, 130, 246, 0.2)" }}>
                                {item.quantity} {item.unit || "unit"}
                              </span>
                            </td>
                            <td className={styles.amountText}>
                              {selectedCategory === "SAPI" ? formatRp(item.amount) : selectedCategory === "EMAS" ? "Harga Langsung" : formatRp(item.amount)}
                            </td>
                            <td>
                              <span
                                className={`${styles.amountText} ${
                                  selectedCategory === "HUTANG"
                                    ? styles.amountExpense
                                    : styles.amountIncome
                                }`}
                              >
                                {formatRp(selectedCategory === "SAPI" ? (item.amount || 0) * (item.quantity || 1) : item.amount || 0)}
                              </span>
                            </td>
                            <td>
                              <div
                                className={styles.actionCell}
                                style={{ justifyContent: "flex-end" }}
                              >
                                <button
                                  type="button"
                                  className={`${styles.iconBtn} ${styles.edit}`}
                                  onClick={() => openEditAssetItem(item)}
                                  title="Edit Item Ini"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.iconBtn} ${styles.delete}`}
                                  onClick={() => handleDeleteAssetItem(item.id)}
                                  title="Hapus Item Ini"
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
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT CASHBOOK TRANSACTION (FOR CASHBOOK ONLY)             */}
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
    </div>
  );
}
