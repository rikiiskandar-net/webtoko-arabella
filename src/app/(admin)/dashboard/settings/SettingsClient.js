"use client";

import { useState, useEffect } from "react";
import styles from "./Settings.module.css";
import { useNotification } from "@/lib/useNotification";

export default function SettingsClient() {
  const { notify, NotificationBar } = useNotification();
  const [form, setForm] = useState({
    storeName: "",
    waNumber: "",
    description: "",
    address: "",
    hours: "",
    deliveryETA: "",
    instagram: "",
    email: "",
    paymentMethods: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        setForm({
          storeName: data.storeName || "",
          waNumber: data.waNumber || "",
          description: data.description || "",
          address: data.address || "",
          hours: data.hours || "",
          deliveryETA: data.deliveryETA || "",
          instagram: data.instagram || "",
          email: data.email || "",
          paymentMethods: data.paymentMethods || "",
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

  if (loading) {
    return <div className={styles.page}><p>Memuat pengaturan...</p></div>;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Pengaturan Toko</h2>
      <p className={styles.pageDesc}>Atur profil toko yang tampil di website dan nomor WhatsApp.</p>

      <form onSubmit={handleSave}>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Informasi Toko</h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Toko</label>
            <input className={styles.input} value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} placeholder="Dapur Arabella" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Deskripsi Toko</label>
            <textarea className={styles.textarea} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Deskripsi singkat tentang toko..." />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Alamat</label>
            <textarea className={styles.textarea} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Alamat lokasi toko..." />
            <span className={styles.helpText}>Digunakan untuk informasi pengiriman.</span>
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.sectionTitle}>Kontak & Layanan</h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nomor WhatsApp</label>
            <input className={styles.input} value={form.waNumber} onChange={e => setForm({...form, waNumber: e.target.value})} placeholder="6281234567890" />
            <span className={styles.helpText}>Format: 628xxx (tanpa + atau spasi)</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Jam Operasional</label>
            <input className={styles.input} value={form.hours} onChange={e => setForm({...form, hours: e.target.value})} placeholder="Tutup pukul 21.00" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Estimasi Pengiriman</label>
            <input className={styles.input} value={form.deliveryETA} onChange={e => setForm({...form, deliveryETA: e.target.value})} placeholder="Antar mulai 15 menit" />
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.sectionTitle}>Media Sosial & Pembayaran</h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Instagram</label>
            <input className={styles.input} value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} placeholder="@dapur.arabella" />
            <span className={styles.helpText}>Username Instagram tanpa URL lengkap.</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="hello@dapurarabella.com" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Metode Pembayaran</label>
            <input className={styles.input} value={form.paymentMethods} onChange={e => setForm({...form, paymentMethods: e.target.value})} placeholder="BCA, Mandiri, GoPay, OVO, ShopeePay" />
            <span className={styles.helpText}>Pisahkan dengan koma.</span>
          </div>
        </div>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
      {NotificationBar}
    </div>
  );
}
