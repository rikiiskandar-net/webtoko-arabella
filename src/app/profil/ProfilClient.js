"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Profil.module.css";

export default function ProfilClient() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => {
        if (res.status === 401) { router.push("/masuk"); return null; }
        return res.json();
      })
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
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setUser({ ...user, ...data });
        setMessage({ type: "success", text: "Profil berhasil disimpan!" });
      }
    } catch {
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
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
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setUser({ ...user, avatar: data.avatar });
        setMessage({ type: "success", text: "Foto profil berhasil diperbarui!" });
      }
    } catch {
      setMessage({ type: "error", text: "Gagal mengunggah foto" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}><div className={styles.spinner}></div></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>← Kembali ke Toko</Link>

        <div className={styles.card}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap} onClick={() => fileInputRef.current?.click()}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarInitials}>{getInitials(user?.name)}</div>
              )}
              <div className={styles.avatarOverlay}>
                {uploadingAvatar ? "⏳" : "📷"}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
            <h2 className={styles.userName}>{user?.name}</h2>
            <p className={styles.userEmail}>{user?.email}</p>
            <p className={styles.memberSince}>Member sejak {new Date(user?.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSave} className={styles.form}>
            <h3 className={styles.sectionTitle}>Edit Profil</h3>

            {message.text && (
              <div className={message.type === "success" ? styles.successBox : styles.errorBox}>
                {message.text}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Nama Lengkap</label>
              <input type="text" className={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input type="email" className={styles.input} value={user?.email || ""} disabled className={styles.inputDisabled} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nomor Telepon / WhatsApp</label>
              <input type="tel" className={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08xx-xxxx-xxxx" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Alamat Lengkap</label>
              <textarea className={styles.textarea} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota" rows={3} />
            </div>

            <button type="submit" className={styles.btnSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>

          <div className={styles.divider} />
          <div className={styles.actions}>
            <Link href="/keranjang" className={styles.btnCart}>🛒 Lihat Keranjang Belanja</Link>
            <button onClick={handleLogout} className={styles.btnLogout}>Keluar dari Akun</button>
          </div>
        </div>
      </div>
    </div>
  );
}
