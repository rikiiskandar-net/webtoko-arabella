"use client";

import { useState, useEffect } from "react";
import styles from "./About.module.css";
import { useNotification } from "@/lib/useNotification";
import ImageCropper from "@/components/ImageCropper";

export default function AboutClient() {
  const { notify, NotificationBar } = useNotification();
  const [form, setForm] = useState({
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
  const [cropImageSrc, setCropImageSrc] = useState(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
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

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("File harus berupa gambar", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImageSrc(e.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = async (croppedFile) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", croppedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah foto");
      const { url } = await res.json();
      
      setForm(prev => ({ ...prev, aboutImage: url }));
      setCropImageSrc(null);
      notify("Foto berhasil diunggah!");
    } catch (error) {
      notify("Error: " + error.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className={styles.page}><p>Memuat pengaturan...</p></div>;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Pengaturan "Tentang Kami"</h2>
      <p className={styles.pageDesc}>Atur bagian cerita toko, lencana, dan gambar utama Anda.</p>

      <form onSubmit={handleSave}>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Teks & Cerita</h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Judul</label>
            <input className={styles.input} value={form.aboutTitle} onChange={e => setForm({...form, aboutTitle: e.target.value})} placeholder="Berawal dari Camilan Sehat untuk Anak" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Deskripsi (Bisa lebih dari 1 paragraf)</label>
            <textarea className={styles.textarea} rows={6} value={form.aboutDescription} onChange={e => setForm({...form, aboutDescription: e.target.value})} placeholder="Ceritakan bagaimana toko Anda bermula..." />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Poin-poin Garansi (Pisahkan dengan koma)</label>
            <input className={styles.input} value={form.aboutPoints} onChange={e => setForm({...form, aboutPoints: e.target.value})} placeholder="Tanpa Bahan Pengawet,Bahan Bumbu Pilihan,Kebersihan Terjamin,Dibuat Terbatas (Fresh)" />
            <span className={styles.helpText}>Akan ditampilkan dengan ikon centang biru. Maksimal 4 poin agar terlihat rapi.</span>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.sectionTitle}>Lencana Mengambang & Gambar Utama</h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Teks Atas Lencana (Nomor/Persen)</label>
            <input className={styles.input} value={form.aboutBadgeNumber} onChange={e => setForm({...form, aboutBadgeNumber: e.target.value})} placeholder="100%" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Teks Bawah Lencana (Gunakan \n untuk baris baru)</label>
            <input className={styles.input} value={form.aboutBadgeText} onChange={e => setForm({...form, aboutBadgeText: e.target.value})} placeholder="Buatan\nTangan" />
            <span className={styles.helpText}>Contoh: Buatan\nTangan</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Gambar Dapur (Upload Baru)</label>
            {form.aboutImage && (
              <div style={{ marginBottom: '1rem' }}>
                <img src={form.aboutImage} alt="About Us" style={{ width: '200px', borderRadius: '12px', border: '1px solid #ddd' }} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={onFileSelect} className={styles.fileInput} />
            <span className={styles.helpText}>Gunakan foto dapur, proses memasak, atau foto keluarga. Rasio 4:3.</span>
          </div>
        </div>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>

      {cropImageSrc && (
        <ImageCropper 
          imageSrc={cropImageSrc}
          onCancel={() => setCropImageSrc(null)}
          onCropComplete={onCropComplete}
          isUploading={isUploading}
        />
      )}

      {NotificationBar}
    </div>
  );
}
