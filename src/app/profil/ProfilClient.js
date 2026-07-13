"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, Pencil, Lock, ShoppingCart, LogOut, Camera, Loader2, ChevronLeft, Eye, EyeOff, ShieldCheck, MapPin, Phone, Mail, CalendarDays, Package, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import styles from "./Profil.module.css";

const TABS = [
  { id: "info", label: "Info Akun", icon: User },
  { id: "edit", label: "Edit Profil", icon: Pencil },
  { id: "password", label: "Ganti Password", icon: Lock },
  { id: "orders", label: "Riwayat Pesanan", icon: Package },
  { id: "cart", label: "Keranjang", icon: ShoppingCart, href: "/keranjang" },
];

export default function ProfilClient() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  // Edit form states
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password form states
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState({ type: "", text: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => { if (res.status === 401) { router.push("/masuk"); return null; } return res.json(); })
      .then(data => {
        if (data) {
          setUser(data);
          setForm({ name: data.name, phone: data.phone || "", address: data.address || "" });
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error }); }
      else { setUser({ ...user, ...data }); setMessage({ type: "success", text: "Profil berhasil disimpan!" }); }
    } catch { setMessage({ type: "error", text: "Terjadi kesalahan" }); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch("/api/user/profile", { method: "PATCH", body: formData });
      const data = await res.json();
      if (!res.ok) { setMessage({ type: "error", text: data.error }); }
      else { setUser({ ...user, avatar: data.avatar }); setMessage({ type: "success", text: "Foto profil berhasil diperbarui!" }); }
    } catch { setMessage({ type: "error", text: "Gagal mengunggah foto" }); }
    finally { setUploadingAvatar(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMessage({ type: "", text: "" });
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMessage({ type: "error", text: "Konfirmasi password tidak cocok" });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPwMessage({ type: "error", text: data.error }); }
      else {
        setPwMessage({ type: "success", text: "Password berhasil diubah! 🎉" });
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch { setPwMessage({ type: "error", text: "Terjadi kesalahan" }); }
    finally { setPwSaving(false); }
  };

  const handleLogout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    window.location.href = "/";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/user/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleTabClick = (tab) => {
    if (tab.href) {
      router.push(tab.href);
    } else {
      setActiveTab(tab.id);
      if (tab.id === "orders") {
        fetchOrders();
      }
    }
    setMessage({ type: "", text: "" });
    setPwMessage({ type: "", text: "" });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}><Loader2 size={40} className={styles.spin} /></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topNav}>
          <Link href="/" className={styles.backBtn}>
            <ChevronLeft size={24} />
          </Link>
          <h1 className={styles.pageTitle}>Profil Saya</h1>
          <div style={{ width: 24 }}></div>
        </div>

        <div className={styles.layout}>
          {/* ===== SIDEBAR ===== */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarAvatar}>
              <div className={styles.avatarWrap} onClick={() => fileInputRef.current?.click()}>
                {user?.avatar ? (
                  <Image src={user.avatar || "/images/placeholder.png"} alt="Avatar" className={styles.avatarImg} width={80} height={80} style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.avatarInitials}>{getInitials(user?.name)}</div>
                )}
                <div className={styles.avatarOverlay}>
                  {uploadingAvatar ? <Loader2 size={16} className={styles.spin} /> : <Camera size={16} />}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
              <h3 className={styles.sidebarName}>{user?.name}</h3>
              <p className={styles.sidebarEmail}>{user?.email}</p>
            </div>

            {/* Tab Menu */}
            <nav className={styles.sidebarNav}>
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`${styles.sidebarItem} ${activeTab === tab.id && !tab.href ? styles.sidebarItemActive : ""}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <div className={styles.sidebarDivider} />
              <button className={`${styles.sidebarItem} ${styles.sidebarLogout}`} onClick={handleLogout}>
                <LogOut size={18} />
                <span>Keluar</span>
              </button>
            </nav>
          </aside>

          {/* ===== MOBILE HEADER (NEW) ===== */}
          <div className={styles.mobileProfileHeader}>
            <div className={styles.mobileAvatarWrap} onClick={() => fileInputRef.current?.click()}>
              {user?.avatar ? (
                <Image src={user.avatar || "/images/placeholder.png"} alt="Avatar" className={styles.mobileAvatarImg} width={64} height={64} style={{ objectFit: 'cover' }} />
              ) : (
                <div className={styles.mobileAvatarInitials}>{getInitials(user?.name)}</div>
              )}
              <div className={styles.avatarOverlayMobile}>
                {uploadingAvatar ? <Loader2 size={12} className={styles.spin} /> : <Camera size={12} />}
              </div>
            </div>
            <div className={styles.mobileUserInfo}>
              <h2 className={styles.mobileUserName}>{user?.name}</h2>
              <p className={styles.mobileUserEmail}>{user?.email}</p>
            </div>
          </div>

          {/* ===== Mobile Tab Bar ===== */}
          <div className={styles.mobileTabBar}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`${styles.mobileTab} ${activeTab === tab.id && !tab.href ? styles.mobileTabActive : ""}`}
                  onClick={() => handleTabClick(tab)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ===== CONTENT ===== */}
          <main className={styles.content}>
            {/* ---- INFO TAB ---- */}
            {activeTab === "info" && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Informasi Akun</h2>
                  <p className={styles.cardSubtitle}>Detail akun dan informasi pribadi Anda</p>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}><User size={18} /></div>
                    <div><span className={styles.infoLabel}>Nama Lengkap</span><span className={styles.infoValue}>{user?.name}</span></div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}><Mail size={18} /></div>
                    <div><span className={styles.infoLabel}>Email</span><span className={styles.infoValue}>{user?.email}</span></div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}><Phone size={18} /></div>
                    <div><span className={styles.infoLabel}>No. Telepon</span><span className={styles.infoValue}>{user?.phone || "Belum diisi"}</span></div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}><MapPin size={18} /></div>
                    <div><span className={styles.infoLabel}>Alamat</span><span className={styles.infoValue}>{user?.address || "Belum diisi"}</span></div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}><CalendarDays size={18} /></div>
                    <div><span className={styles.infoLabel}>Member Sejak</span><span className={styles.infoValue}>{new Date(user?.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <button className={styles.btnPrimary} onClick={() => setActiveTab("edit")}>
                    <Pencil size={16} /> Edit Profil
                  </button>
                </div>
              </div>
            )}

            {/* ---- EDIT TAB ---- */}
            {activeTab === "edit" && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Edit Profil</h2>
                  <p className={styles.cardSubtitle}>Perbarui informasi pribadi Anda</p>
                </div>
                <form onSubmit={handleSave} className={styles.formBody}>
                  {message.text && (
                    <div className={message.type === "success" ? styles.successBox : styles.errorBox}>{message.text}</div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nama Lengkap</label>
                    <input type="text" className={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input type="email" className={`${styles.input} ${styles.inputDisabled}`} value={user?.email || ""} disabled />
                    <span className={styles.helpText}>Email tidak dapat diubah</span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nomor Telepon / WhatsApp</label>
                    <input type="tel" className={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xx-xxxx-xxxx" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Alamat Lengkap</label>
                    <textarea className={styles.textarea} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota" rows={3} />
                  </div>
                  <button type="submit" className={styles.btnPrimary} disabled={saving}>
                    {saving ? <><Loader2 size={16} className={styles.spin} /> Menyimpan...</> : "Simpan Perubahan"}
                  </button>
                </form>
              </div>
            )}

            {/* ---- PASSWORD TAB ---- */}
            {activeTab === "password" && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleRow}>
                    <ShieldCheck size={22} className={styles.cardTitleIcon} />
                    <div>
                      <h2 className={styles.cardTitle}>Keamanan Akun</h2>
                      <p className={styles.cardSubtitle}>Ubah password untuk menjaga keamanan akun Anda</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleChangePassword} className={styles.formBody}>
                  {pwMessage.text && (
                    <div className={pwMessage.type === "success" ? styles.successBox : styles.errorBox}>{pwMessage.text}</div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password Lama</label>
                    <div className={styles.passwordWrap}>
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        className={styles.input}
                        value={pwForm.currentPassword}
                        onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        placeholder="Masukkan password lama"
                        required
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrentPw(!showCurrentPw)}>
                        {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password Baru</label>
                    <div className={styles.passwordWrap}>
                      <input
                        type={showNewPw ? "text" : "password"}
                        className={styles.input}
                        value={pwForm.newPassword}
                        onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        required
                      />
                      <button type="button" className={styles.eyeBtn} onClick={() => setShowNewPw(!showNewPw)}>
                        {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      className={styles.input}
                      value={pwForm.confirmPassword}
                      onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      placeholder="Ketik ulang password baru"
                      required
                    />
                  </div>
                  <button type="submit" className={styles.btnPrimary} disabled={pwSaving}>
                    {pwSaving ? <><Loader2 size={16} className={styles.spin} /> Mengubah...</> : <><Lock size={16} /> Ubah Password</>}
                  </button>
                </form>
              </div>
            )}

            {/* ---- ORDERS TAB ---- */}
            {activeTab === "orders" && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Riwayat Pesanan</h2>
                  <p className={styles.cardSubtitle}>Lacak pesanan terbaru dan riwayat belanja Anda</p>
                </div>
                
                <div className={styles.cardBody}>
                  {loadingOrders ? (
                    <div className={styles.loadingState}>
                      <Loader2 className={styles.spin} size={24} />
                      <p>Memuat pesanan...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconWrap}>
                        <Package size={48} className={styles.emptyIcon} />
                      </div>
                      <h3 className={styles.emptyTitle}>Belum Ada Pesanan</h3>
                      <p className={styles.emptyText}>Anda belum pernah melakukan pesanan. Yuk belanja sekarang!</p>
                      <Link href="/" className={styles.btnPrimary}>Mulai Belanja</Link>
                    </div>
                  ) : (
                    <div className={styles.ordersList}>
                      {orders.map(order => {
                        // Format date
                        const orderDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        });
                        
                        // Parse status
                        let StatusIcon = Clock;
                        let statusText = "Menunggu Proses";
                        let statusClass = styles.statusPending;
                        
                        if (order.status === 'confirmed' || order.status === 'preparing') {
                          StatusIcon = Loader2;
                          statusText = "Sedang Diproses";
                          statusClass = styles.statusProcessing;
                        } else if (order.status === 'ready' || order.status === 'completed') {
                          StatusIcon = CheckCircle2;
                          statusText = "Selesai";
                          statusClass = styles.statusCompleted;
                        } else if (order.status === 'cancelled') {
                          StatusIcon = XCircle;
                          statusText = "Dibatalkan";
                          statusClass = styles.statusCancelled;
                        }

                        // Get first item for preview
                        const items = Array.isArray(order.items) ? order.items : [];
                        const firstItem = items[0];
                        const moreItemsCount = items.length - 1;
                        
                        return (
                          <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                              <div className={styles.orderMeta}>
                                <span className={styles.orderId}><FileText size={14} /> #{order.id.split('-')[0].toUpperCase()}</span>
                                <span className={styles.orderDate}>{orderDate}</span>
                              </div>
                              <div className={`${styles.orderStatusBadge} ${statusClass}`}>
                                <StatusIcon size={14} className={order.status === 'confirmed' || order.status === 'preparing' ? styles.spin : ''} />
                                {statusText}
                              </div>
                            </div>
                            
                            <div className={styles.orderBody}>
                              {firstItem && (
                                <div className={styles.orderItemPreview}>
                                  <div className={styles.orderItemDetails}>
                                    <span className={styles.orderItemQty}>{firstItem.qty}x</span>
                                    <span className={styles.orderItemName}>{firstItem.name}</span>
                                  </div>
                                  {moreItemsCount > 0 && (
                                    <div className={styles.orderMoreItems}>
                                      + {moreItemsCount} item lainnya
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className={styles.orderTotal}>
                                <span>Total Belanja</span>
                                <span className={styles.orderTotalAmount}>
                                  Rp {order.totalPrice.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
}
