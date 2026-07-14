"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2, Loader2, TrendingUp, TrendingDown, Wallet, X, ArrowUpCircle, ArrowDownCircle, SlidersHorizontal, Calendar, BarChart3 } from "lucide-react";
import styles from "./Cashbook.module.css";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const toLocalDateString = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
};

const toLocalDateTimeString = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}T${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
};

export default function CashbookClient() {
  const [activeTab, setActiveTab] = useState("daily");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sort & Filter states
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest, lowest
  const [filterType, setFilterType] = useState("all"); // all, income, expense

  // Form states
  const [formType, setFormType] = useState("income");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(toLocalDateTimeString(new Date()));

  // Fetch daily entries
  useEffect(() => {
    if (activeTab === "daily") fetchDaily();
  }, [activeTab, selectedDate]);

  // Fetch monthly summary
  useEffect(() => {
    if (activeTab === "monthly") fetchMonthly();
  }, [activeTab, selectedMonth, selectedYear]);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cashbook?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchMonthly = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cashbook/summary?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlySummary(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setFormType("income");
    setFormAmount("");
    setFormDescription("");
    const now = new Date();
    setFormDate(`${selectedDate}T${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`);
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
      const body = { type: formType, amount: parseInt(formAmount), description: formDescription, date: formDate };
      let res;
      if (editingEntry) {
        res = await fetch(`/api/admin/cashbook/${editingEntry.id}`, {
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
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus catatan ini?")) return;
    try {
      const res = await fetch(`/api/admin/cashbook/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activeTab === "daily") fetchDaily();
        else fetchMonthly();
      }
    } catch (err) { console.error(err); }
  };

  // Daily calculations
  const dailyIncome = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const dailyExpense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const dailyBalance = dailyIncome - dailyExpense;

  // Apply filter & sort
  const filteredEntries = entries
    .filter(e => filterType === "all" ? true : e.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest": return new Date(a.date) - new Date(b.date);
        case "highest": return b.amount - a.amount;
        case "lowest": return a.amount - b.amount;
        case "newest":
        default: return new Date(b.date) - new Date(a.date);
      }
    });

  // Year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) yearOptions.push(y);

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>📒 Buku Kas</h2>
      </div>

      {/* Marquee Semangat */}
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

      {/* Tab Switcher */}
      <div className={styles.tabContainer}>
        <button className={`${styles.tab} ${activeTab === "daily" ? styles.tabActive : ""}`} onClick={() => setActiveTab("daily")}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Calendar size={18} /> Harian
          </div>
        </button>
        <button className={`${styles.tab} ${activeTab === "monthly" ? styles.tabActive : ""}`} onClick={() => setActiveTab("monthly")}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
              <div className={styles.summaryLabel}><TrendingUp size={16} /> Pemasukan</div>
              <div className={styles.summaryValue}>{formatRp(dailyIncome)}</div>
            </div>
            <div className={`${styles.summaryCard} ${styles.cardExpense}`}>
              <div className={styles.summaryLabel}><TrendingDown size={16} /> Pengeluaran</div>
              <div className={styles.summaryValue}>{formatRp(dailyExpense)}</div>
            </div>
            <div className={`${styles.summaryCard} ${styles.cardBalance}`}>
              <div className={styles.summaryLabel}><Wallet size={16} /> Saldo Bersih</div>
              <div className={styles.summaryValue}>{formatRp(dailyBalance)}</div>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controlRow}>
            <div className={styles.dateControl}>
              <input type="date" className={styles.dateInput} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <button className={styles.addBtn} onClick={openAddModal}>
              <Plus size={18} /> Catat Transaksi
            </button>
          </div>

          {/* Filter & Sort Bar */}
          {entries.length > 0 && (
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}><SlidersHorizontal size={14} /> Filter:</span>
                <button className={`${styles.filterPill} ${filterType === "all" ? styles.filterPillActive : ""}`} onClick={() => setFilterType("all")}>Semua</button>
                <button className={`${styles.filterPill} ${filterType === "income" ? styles.filterPillActive : ""} ${filterType === "income" ? styles.filterPillIncome : ""}`} onClick={() => setFilterType("income")}>💰 Pemasukan</button>
                <button className={`${styles.filterPill} ${filterType === "expense" ? styles.filterPillActive : ""} ${filterType === "expense" ? styles.filterPillExpense : ""}`} onClick={() => setFilterType("expense")}>💸 Pengeluaran</button>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Urutkan:</span>
                <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">⏰ Terbaru</option>
                  <option value="oldest">📅 Terlama</option>
                  <option value="highest">📈 Terbanyak</option>
                  <option value="lowest">📉 Terkecil</option>
                </select>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className={styles.emptyState}><Loader2 size={40} className={styles.spin} /><h3>Memuat data...</h3></div>
          ) : entries.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={48} className={styles.emptyIcon} />
              <h3>Belum ada catatan</h3>
              <p>Klik &quot;Catat Transaksi&quot; untuk mulai mencatat pemasukan atau pengeluaran hari ini.</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={48} className={styles.emptyIcon} />
              <h3>Tidak ada data yang cocok</h3>
              <p>Coba ubah filter atau urutan Anda.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Jenis</th>
                    <th>Keterangan</th>
                    <th style={{textAlign:"right"}}>Jumlah</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr key={entry.id}>
                      <td>{new Date(entry.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${entry.type === "income" ? styles.typeIncome : styles.typeExpense}`}>
                          {entry.type === "income" ? <><ArrowUpCircle size={14} /> Masuk</> : <><ArrowDownCircle size={14} /> Keluar</>}
                        </span>
                      </td>
                      <td>{entry.description}</td>
                      <td style={{textAlign:"right"}}>
                        <span className={`${styles.amountText} ${entry.type === "income" ? styles.amountIncome : styles.amountExpense}`}>
                          {entry.type === "income" ? "+" : "-"}{formatRp(entry.amount)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button className={`${styles.iconBtn} ${styles.edit}`} onClick={() => openEditModal(entry)} title="Edit"><Pencil size={16} /></button>
                          <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDelete(entry.id)} title="Hapus"><Trash2 size={16} /></button>
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
          {/* Summary Cards */}
          {monthlySummary && (
            <div className={styles.summaryGrid}>
              <div className={`${styles.summaryCard} ${styles.cardIncome}`}>
                <div className={styles.summaryLabel}><TrendingUp size={16} /> Total Pemasukan</div>
                <div className={styles.summaryValue}>{formatRp(monthlySummary.totalIncome)}</div>
              </div>
              <div className={`${styles.summaryCard} ${styles.cardExpense}`}>
                <div className={styles.summaryLabel}><TrendingDown size={16} /> Total Pengeluaran</div>
                <div className={styles.summaryValue}>{formatRp(monthlySummary.totalExpense)}</div>
              </div>
              <div className={`${styles.summaryCard} ${styles.cardBalance}`}>
                <div className={styles.summaryLabel}><Wallet size={16} /> Laba / Rugi</div>
                <div className={styles.summaryValue}>{formatRp(monthlySummary.balance)}</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={styles.controlRow}>
            <div className={styles.dateControl}>
              <select className={styles.monthSelect} value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select className={styles.monthSelect} value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Monthly Table */}
          {loading ? (
            <div className={styles.emptyState}><Loader2 size={40} className={styles.spin} /><h3>Memuat ringkasan...</h3></div>
          ) : !monthlySummary || monthlySummary.days.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={48} className={styles.emptyIcon} />
              <h3>Belum ada data bulan ini</h3>
              <p>Pindah ke tab Harian untuk mulai mencatat transaksi.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th style={{textAlign:"right"}}>Pemasukan</th>
                    <th style={{textAlign:"right"}}>Pengeluaran</th>
                    <th style={{textAlign:"right"}}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.days.map(day => {
                    const balance = day.income - day.expense;
                    return (
                      <tr key={day.date}>
                        <td>{new Date(day.date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}</td>
                        <td style={{textAlign:"right"}}><span className={styles.amountIncome}>{day.income > 0 ? formatRp(day.income) : "-"}</span></td>
                        <td style={{textAlign:"right"}}><span className={styles.amountExpense}>{day.expense > 0 ? formatRp(day.expense) : "-"}</span></td>
                        <td style={{textAlign:"right"}}>
                          <span className={balance >= 0 ? styles.balancePositive : styles.balanceNegative}>
                            {formatRp(balance)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ======================== MODAL ======================== */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingEntry ? "Edit Catatan" : "Catat Transaksi Baru"}</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div className={styles.formBody}>
              {/* Type Toggle */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Jenis Transaksi</label>
                <div className={styles.typeToggle}>
                  <button 
                    className={`${styles.typeBtn} ${formType === "income" ? styles.typeBtnIncome : ""}`}
                    onClick={() => setFormType("income")}
                  >
                    <ArrowUpCircle size={18} /> Pemasukan
                  </button>
                  <button 
                    className={`${styles.typeBtn} ${formType === "expense" ? styles.typeBtnExpense : ""}`}
                    onClick={() => setFormType("expense")}
                  >
                    <ArrowDownCircle size={18} /> Pengeluaran
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Jumlah (Rp)</label>
                <div className={styles.currencyPrefix}>
                  <span className={styles.prefix}>Rp</span>
                  <input
                    type="number"
                    className={`${styles.input} ${styles.inputAmount}`}
                    placeholder="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Keterangan</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Contoh: Penjualan Es Mambo, Beli bahan tepung..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Tanggal</label>
                <input
                  type="datetime-local"
                  className={styles.input}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Batal</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !formAmount || !formDescription}>
                {saving ? "Menyimpan..." : editingEntry ? "Simpan Perubahan" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
