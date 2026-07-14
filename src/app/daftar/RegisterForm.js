"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, ChefHat, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import styles from "../masuk/Auth.module.css";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal");
        return;
      }

      window.location.href = "/profil";
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIconWrapper}>
            <ChefHat size={32} />
          </div>
          <h1 className={styles.brandName}>Dapur Arabella</h1>
        </div>

        <h2 className={styles.title}>Buat Akun Baru</h2>
        <p className={styles.subtitle}>Daftar untuk kemudahan berbelanja</p>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Lengkap</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input
                type="text"
                className={styles.input}
                placeholder="Nama Anda"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                type="email"
                className={styles.input}
                placeholder="contoh@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                className={styles.passwordToggleBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Konfirmasi Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type={showConfirm ? "text" : "password"}
                className={styles.input}
                placeholder="Ulangi password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
              <button
                type="button"
                className={styles.passwordToggleBtn}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? <Loader2 size={20} className={styles.spinner} /> : null}
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className={styles.switchText}>
          Sudah punya akun?{" "}
          <Link href="/masuk" className={styles.link}>Masuk di sini</Link>
        </p>

        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali ke Toko
        </Link>
      </div>
    </div>
  );
}
