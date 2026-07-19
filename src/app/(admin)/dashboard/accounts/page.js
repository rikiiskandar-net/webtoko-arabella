"use client";

import { useState, useEffect } from "react";
import styles from "./Accounts.module.css";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Plus, MagnifyingGlass as Search, Trash, PencilSimple as Edit2, Copy, CheckCircle, ArrowSquareOut as ExternalLink, Eye, EyeSlash as EyeOff, X, UploadSimple } from "@phosphor-icons/react";
import Toast from "@/components/Toast";

// List of available icons for categories
const availableIcons = ["Folder", "FacebookLogo", "InstagramLogo", "TwitterLogo", "YoutubeLogo", "EnvelopeSimple", "Globe", "Cloud", "Database", "HardDrives", "GithubLogo", "FigmaLogo", "TrelloLogo", "SlackLogo"];

export default function AccountsPage() {
  const [categories, setCategories] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  // Modal States
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  
  // Form States
  const [catForm, setCatForm] = useState({ id: null, name: "", icon: "Folder" });
  const [credForm, setCredForm] = useState({ id: null, categoryId: "", title: "", username: "", password: "", url: "", description: "" });
  const [bulkData, setBulkData] = useState("");
  
  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [fetchingPassword, setFetchingPassword] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const catRes = await fetch("/api/admin/accounts/categories");
      if (catRes.ok) setCategories(await catRes.json());

      let credUrl = "/api/admin/accounts/credentials";
      if (activeCategory !== "ALL") {
        credUrl += `?categoryId=${activeCategory}`;
      }
      const credRes = await fetch(credUrl);
      if (credRes.ok) setCredentials(await credRes.json());
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  // Helpers
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Disalin ke clipboard!");
  };

  const fetchPassword = async (id) => {
    if (decryptedPasswords[id]) return decryptedPasswords[id];
    
    setFetchingPassword(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/admin/accounts/credentials/${id}/reveal`);
      if (!res.ok) throw new Error("Gagal mengambil sandi");
      const data = await res.json();
      setDecryptedPasswords(prev => ({ ...prev, [id]: data.password }));
      return data.password;
    } catch (err) {
      showToast(err.message, "error");
      return null;
    } finally {
      setFetchingPassword(prev => ({ ...prev, [id]: false }));
    }
  };

  const togglePasswordVisibility = async (id) => {
    if (!showPasswords[id] && !decryptedPasswords[id]) {
      await fetchPassword(id);
    }
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = async (id) => {
    let pwd = decryptedPasswords[id];
    if (!pwd) {
      pwd = await fetchPassword(id);
    }
    if (pwd) {
      copyToClipboard(pwd);
    }
  };

  const getLucideIcon = (iconName) => {
    const IconComponent = PhosphorIcons[iconName] || PhosphorIcons.Folder;
    return <IconComponent size={20} weight="duotone" />;
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/admin/accounts/categories";
      const method = catForm.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kategori");
      
      showToast("Kategori berhasil disimpan");
      setCatModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Hapus kategori ini? Semua akun di dalamnya akan ikut terhapus!")) return;
    
    try {
      const res = await fetch(`/api/admin/accounts/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      
      showToast("Kategori dihapus");
      if (activeCategory === id) setActiveCategory("ALL");
      else fetchData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // --- Credential Handlers ---
  const handleSaveCredential = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/admin/accounts/credentials";
      const method = credForm.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan akun");
      
      showToast("Akun berhasil disimpan");
      setCredModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCredential = async (id) => {
    if (!confirm("Hapus akun ini?")) return;
    
    try {
      const res = await fetch(`/api/admin/accounts/credentials?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      
      showToast("Akun dihapus");
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkData.trim()) return showToast("Data tidak boleh kosong", "error");
    
    setSubmitting(true);
    try {
      // Parse bulkData text: email|password|category|notes
      const lines = bulkData.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      const accounts = lines.map(line => {
        const parts = line.split("|");
        return {
          email: parts[0]?.trim() || "",
          password: parts[1]?.trim() || "",
          categoryName: parts[2]?.trim() || "",
          notes: parts.slice(3).join("|").trim() || ""
        };
      }).filter(acc => acc.email && acc.password && acc.categoryName);
      
      if (accounts.length === 0) {
        throw new Error("Format data tidak valid. Pastikan formatnya: email|password|kategori");
      }

      const res = await fetch("/api/admin/accounts/credentials/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accounts })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengimpor data");
      
      showToast(`Berhasil mengimpor ${data.count} akun`);
      setBulkModalOpen(false);
      setBulkData("");
      fetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered credentials based on search
  const filteredCredentials = credentials.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {toast.visible && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, visible: false })} />}
      
      <div className={styles.header}>
        <div>
          <h1>Pengelola Akun & Sandi</h1>
          <p>Kelola semua aset digital dan kredensial bisnis Anda secara terenkripsi.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={styles.addBtn}
            onClick={() => setBulkModalOpen(true)}
            style={{ backgroundColor: '#10B981', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
          >
            <UploadSimple size={18} /> Bulk Import
          </button>
          <button 
            className={styles.addBtn}
            onClick={() => {
              setCredForm({ id: null, categoryId: activeCategory !== "ALL" ? activeCategory : (categories[0]?.id || ""), title: "", username: "", password: "", url: "", description: "" });
              setCredModalOpen(true);
            }}
          >
            <Plus size={18} /> Tambah Akun
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar Categories */}
        <div className={styles.categoriesCard}>
          <div className={styles.categoryHeader}>
            <h3>Kategori</h3>
            <button className={styles.addCatBtn} onClick={() => {
              setCatForm({ id: null, name: "", icon: "Folder" });
              setCatModalOpen(true);
            }} title="Kategori Baru">
              <Plus size={16} />
            </button>
          </div>
          
          <div className={styles.categoryList}>
            <div 
              className={`${styles.categoryItem} ${activeCategory === "ALL" ? styles.active : ""}`}
              onClick={() => setActiveCategory("ALL")}
            >
              <div className={styles.categoryItemLeft}>
                <span className={styles.categoryIcon}><PhosphorIcons.SquaresFour size={18} weight="duotone" /></span>
                Semua Akun
              </div>
            </div>
            
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className={`${styles.categoryItem} ${activeCategory === cat.id ? styles.active : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <div className={styles.categoryItemLeft}>
                  <span className={styles.categoryIcon}>{getLucideIcon(cat.icon)}</span>
                  {cat.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span className={styles.categoryCount}>{cat._count?.accounts || 0}</span>
                  <button 
                    className={styles.catDeleteBtn} 
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credentials Grid */}
        <div className={styles.credentialsArea}>
          <div className={styles.credentialsHeader}>
            <div className={styles.searchBox}>
              <Search size={16} color="#9CA3AF" />
              <input 
                type="text" 
                placeholder="Cari akun atau username..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Memuat akun...</div>
          ) : filteredCredentials.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', background: 'rgba(255,255,255,0.5)', borderRadius: '1rem' }}>
              Belum ada akun di kategori ini.
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {filteredCredentials.map(cred => (
                <div key={cred.id} className={styles.credCard}>
                  <div className={styles.credHeader}>
                    <div className={styles.credTitleGroup}>
                      <div className={styles.credIconWrapper}>
                        {getLucideIcon(cred.category?.icon || "Folder")}
                      </div>
                      <div>
                        <h3 className={styles.credTitle}>{cred.title}</h3>
                        <p className={styles.credCategoryName}>{cred.category?.name}</p>
                      </div>
                    </div>
                    <div className={styles.credActions}>
                      <button className={styles.actionBtn} onClick={() => {
                        setCredForm({ ...cred });
                        setCredModalOpen(true);
                      }}>
                        <Edit2 size={16} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDeleteCredential(cred.id)}>
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                  </div>

                  <div className={styles.credBody}>
                    <div className={styles.credField}>
                      <span className={styles.credFieldLabel}>Username / Email</span>
                      <div className={styles.credFieldValue}>
                        <input type="text" readOnly value={cred.username} />
                        <button className={styles.copyBtn} onClick={() => copyToClipboard(cred.username)} title="Salin">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.credField}>
                      <span className={styles.credFieldLabel}>Password</span>
                      <div className={styles.credFieldValue}>
                        <input 
                          type={showPasswords[cred.id] ? "text" : "password"} 
                          readOnly 
                          value={decryptedPasswords[cred.id] || "********"} 
                        />
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className={styles.copyBtn} onClick={() => togglePasswordVisibility(cred.id)} title="Lihat" disabled={fetchingPassword[cred.id]}>
                            {fetchingPassword[cred.id] ? <PhosphorIcons.Spinner size={16} className={styles.spin} /> : (showPasswords[cred.id] ? <EyeOff size={16} /> : <Eye size={16} />)}
                          </button>
                          <button className={styles.copyBtn} onClick={() => handleCopyPassword(cred.id)} title="Salin" disabled={fetchingPassword[cred.id]}>
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(cred.url || cred.description) && (
                    <div className={styles.credFooter}>
                      {cred.description && (
                        <span style={{ fontSize: '0.75rem', color: '#6B7280', maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cred.description}
                        </span>
                      )}
                      {cred.url && (
                        <a href={cred.url.startsWith('http') ? cred.url : `https://${cred.url}`} target="_blank" rel="noopener noreferrer" className={styles.directLink}>
                          Buka Link <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {catModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{catForm.id ? "Edit Kategori" : "Kategori Baru"}</h2>
              <button className={styles.closeBtn} onClick={() => setCatModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nama Kategori</label>
                  <input type="text" value={catForm.name} onChange={(e) => setCatForm({...catForm, name: e.target.value})} required placeholder="Misal: Social Media" />
                </div>
                <div className={styles.formGroup}>
                  <label>Pilih Ikon</label>
                  <div className={styles.iconSelector}>
                    {availableIcons.map(icon => (
                      <div 
                        key={icon} 
                        className={`${styles.iconOption} ${catForm.icon === icon ? styles.selected : ""}`}
                        onClick={() => setCatForm({...catForm, icon})}
                        title={icon}
                      >
                        {getLucideIcon(icon)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setCatModalOpen(false)}>Batal</button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credential Modal */}
      {credModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{credForm.id ? "Edit Akun" : "Tambah Akun Baru"}</h2>
              <button className={styles.closeBtn} onClick={() => setCredModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveCredential}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Kategori</label>
                  <select value={credForm.categoryId} onChange={(e) => setCredForm({...credForm, categoryId: e.target.value})} required>
                    <option value="" disabled>Pilih Kategori...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Judul Akun</label>
                  <input type="text" value={credForm.title} onChange={(e) => setCredForm({...credForm, title: e.target.value})} required placeholder="Misal: Instagram Official" />
                </div>
                <div className={styles.formGroup}>
                  <label>Username / Email</label>
                  <input type="text" value={credForm.username} onChange={(e) => setCredForm({...credForm, username: e.target.value})} required placeholder="admin@domain.com" />
                </div>
                <div className={styles.formGroup}>
                  <label>{credForm.id ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}</label>
                  <input type="text" value={credForm.password} onChange={(e) => setCredForm({...credForm, password: e.target.value})} required={!credForm.id} placeholder="Ketik sandi..." />
                </div>
                <div className={styles.formGroup}>
                  <label>URL / Link Login (Opsional)</label>
                  <input type="text" value={credForm.url} onChange={(e) => setCredForm({...credForm, url: e.target.value})} placeholder="https://..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Catatan Tambahan (Opsional)</label>
                  <textarea rows={2} value={credForm.description} onChange={(e) => setCredForm({...credForm, description: e.target.value})} placeholder="Tahun pembuatan, nomor pemulihan, dsb." />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setCredModalOpen(false)}>Batal</button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2>Bulk Import Akun</h2>
              <button className={styles.closeBtn} onClick={() => setBulkModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleBulkImport}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Masukkan Data Akun (Tiap baris 1 akun)</label>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0 0 0.5rem 0' }}>
                    <strong>Format:</strong> <code>email|password|kategori|catatan opsional</code><br/>
                    Contoh: <code>admin@gmail.com|rahasia123|Sosial Media|Dibuat tahun 2023</code><br/>
                    Kategori yang belum ada otomatis akan dibuatkan.
                  </p>
                  <textarea 
                    rows={8} 
                    value={bulkData} 
                    onChange={(e) => setBulkData(e.target.value)} 
                    required 
                    placeholder="email|password|kategori|catatan opsional" 
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setBulkModalOpen(false)}>Batal</button>
                <button type="submit" className={styles.saveBtn} style={{ backgroundColor: '#10B981' }} disabled={submitting}>
                  {submitting ? "Memproses..." : "Import Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
