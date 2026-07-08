"use client";

import { useState, useEffect } from "react";
import styles from "./Settings.module.css";
import { useNotification } from "@/lib/useNotification";
import { Power, Loader2 } from "lucide-react";

export default function SettingsClient() {
  const { notify, NotificationBar } = useNotification();
  const [form, setForm] = useState({
    isOpen: true,
    storeName: "",
    waNumber: "",
    description: "",
    address: "",
    hours: "",
    deliveryETA: "",
    instagram: "",
    email: "",
    facebook: "",
    paymentMethods: "",
    aboutTitle: "",
    aboutDescription: "",
    aboutPoints: "",
    aboutBadgeNumber: "",
    aboutBadgeText: "",
    aboutImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        setForm({
          isOpen: data.isOpen !== undefined ? data.isOpen : true,
          storeName: data.storeName || "",
          waNumber: data.waNumber || "",
          description: data.description || "",
          address: data.address || "",
          hours: data.hours || "",
          deliveryETA: data.deliveryETA || "",
          instagram: data.instagram || "",
          email: data.email || "",
          facebook: data.facebook || "",
          paymentMethods: data.paymentMethods || "",
          aboutTitle: data.aboutTitle || "",
          aboutDescription: data.aboutDescription || "",
          aboutPoints: data.aboutPoints || "",
          aboutBadgeNumber: data.aboutBadgeNumber || "",
          aboutBadgeText: data.aboutBadgeText || "",
          aboutImage: data.aboutImage || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");
      notify("Pengaturan berhasil disimpan!");
    } catch (err) {
      notify("Error: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      if (!res.ok) throw new Error("Gagal mengunggah gambar");
      const data = await res.json();
      setForm({ ...form, aboutImage: data.url });
      notify("Gambar berhasil diunggah!");
    } catch (error) {
      notify("Error upload gambar: " + error.message, "error");
    } finally {
      setIsUploading(false);
    }
    e.target.value = "";
  };

  const toggleStoreStatus = async () => {
    const newStatus = !form.isOpen;
    setForm({ ...form, isOpen: newStatus });
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isOpen: newStatus }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status toko");
      notify(`Toko berhasil ${newStatus ? 'Buka' : 'Tutup'}!`, newStatus ? 'success' : 'warning');
    } catch (err) {
      setForm({ ...form, isOpen: !newStatus }); // revert
      notify("Error: " + err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={40} style={{ color: "#94A3B8", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className={styles.pageTitle} style={{ marginBottom: '8px' }}>Pengaturan & Kontrol Toko</h2>
          <p className={styles.pageDesc}>Atur profil toko, status buka/tutup, dan halaman "Tentang Kami".</p>
        </div>
        
        {/* Toggle Buka / Tutup Toko */}
        <div style={{ 
          background: form.isOpen ? '#ECFDF5' : '#FEF2F2', 
          border: `1px solid ${form.isOpen ? '#10B981' : '#EF4444'}`,
          padding: '16px 24px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>STATUS TOKO SAAT INI</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: form.isOpen ? '#059669' : '#DC2626' }}>
              {form.isOpen ? 'TOKO BUKA' : 'TOKO TUTUP'}
            </div>
          </div>
          <button 
            type="button"
            onClick={toggleStoreStatus}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: form.isOpen ? '#EF4444' : '#10B981',
              color: 'white', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Power size={18} />
            {form.isOpen ? 'Tutup Toko' : 'Buka Toko'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className={styles.gridContainer}>
          {/* Kolom Kiri */}
          <div className={styles.gridColumn}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Informasi Utama</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Toko</label>
                <input className={styles.input} value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} placeholder="Dapur Arabella" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Deskripsi Singkat (Footer)</label>
                <textarea className={styles.textarea} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Deskripsi singkat tentang toko..." />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Alamat Lengkap</label>
                <textarea className={styles.textarea} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Alamat lokasi toko..." />
                <span className={styles.helpText}>Digunakan untuk informasi pengiriman dan peta.</span>
              </div>
            </div>

            <div className={styles.card} style={{ marginTop: '1.5rem' }}>
              <h3 className={styles.sectionTitle}>Kontak & Layanan</h3>

              <div className={styles.formRow} style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Nomor WhatsApp (Penerima Pesanan)</label>
                  <input className={styles.input} value={form.waNumber} onChange={e => setForm({...form, waNumber: e.target.value})} placeholder="6281234567890" />
                  <span className={styles.helpText}>Format: 628xxx (tanpa + atau spasi)</span>
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Email Toko</label>
                  <input className={styles.input} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="hello@dapurarabella.com" />
                </div>
              </div>

              <div className={styles.formRow} style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Teks Jam Operasional</label>
                  <input className={styles.input} value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} placeholder="Senin-Sabtu: 08.00 - 21.00" />
                </div>

                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Estimasi Pengiriman (Footer)</label>
                  <input className={styles.input} value={form.deliveryETA} onChange={e => setForm({...form, deliveryETA: e.target.value})} placeholder="Antar mulai 15 menit" />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className={styles.gridColumn}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Konten "Tentang Kami" (Beranda)</h3>

              <div className={styles.formRow} style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Judul Bagian</label>
                  <input className={styles.input} value={form.aboutTitle} onChange={e => setForm({...form, aboutTitle: e.target.value})} placeholder="Cth: Berawal dari Camilan Sehat" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cerita Toko</label>
                <textarea className={styles.textarea} rows={5} value={form.aboutDescription} onChange={e => setForm({...form, aboutDescription: e.target.value})} placeholder="Ceritakan sejarah berdirinya toko..." />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Poin Keunggulan (Pisahkan dengan koma)</label>
                <input className={styles.input} value={form.aboutPoints} onChange={e => setForm({...form, aboutPoints: e.target.value})} placeholder="Tanpa Pengawet, Kebersihan Terjamin, Fresh" />
              </div>

              <div className={styles.formRow} style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Angka Lencana (Badge)</label>
                  <input className={styles.input} value={form.aboutBadgeNumber} onChange={e => setForm({...form, aboutBadgeNumber: e.target.value})} placeholder="100%" />
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Teks Lencana (Badge)</label>
                  <input className={styles.input} value={form.aboutBadgeText} onChange={e => setForm({...form, aboutBadgeText: e.target.value})} placeholder="Buatan Tangan" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Foto "Tentang Kami"</label>
                {form.aboutImage && (
                  <div>
                    <img src={form.aboutImage} alt="About Us" style={{ width: '200px', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px', border: '1px solid #E2E8F0' }} />
                  </div>
                )}
                <label style={{ display: 'inline-flex', padding: '10px 20px', background: '#F1F5F9', border: '1px dashed #94A3B8', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading} />
                  {isUploading ? "Mengunggah..." : (form.aboutImage ? "Ganti Foto" : "Pilih Foto")}
                </label>
              </div>
            </div>

            <div className={styles.card} style={{ marginTop: '1.5rem', marginBottom: '100px' }}>
              <h3 className={styles.sectionTitle}>Media Sosial & Pembayaran</h3>

              <div className={styles.formRow} style={{ display: 'flex', gap: '16px' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Instagram Username</label>
                  <input className={styles.input} value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="@dapur.arabella" />
                </div>

                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Facebook Page URL</label>
                  <input className={styles.input} value={form.facebook} onChange={e => setForm({...form, facebook: e.target.value})} placeholder="https://facebook.com/..." />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Metode Pembayaran (Footer)</label>
                <input className={styles.input} value={form.paymentMethods} onChange={e => setForm({...form, paymentMethods: e.target.value})} placeholder="BCA, Mandiri, GoPay, OVO, ShopeePay" />
                <span className={styles.helpText}>Pisahkan dengan koma. Ini hanya untuk ikon tampilan.</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formFooter} style={{ position: 'fixed', bottom: 0, left: '260px', right: 0, background: 'white', padding: '16px 32px', borderTop: '1px solid #E2E8F0', zIndex: 10 }}>
          <button type="submit" className={styles.saveBtn} disabled={saving} style={{ width: '100%', maxWidth: '300px', marginLeft: 'auto', display: 'block', padding: '12px', fontSize: '1rem' }}>
            {saving ? "Menyimpan..." : "Simpan Semua Pengaturan"}
          </button>
        </div>
      </form>
      {NotificationBar}
    </div>
  );
}
