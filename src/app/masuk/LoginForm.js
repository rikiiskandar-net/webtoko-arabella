"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ChefHat, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import styles from "./Auth.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      // Reload agar seluruh client state ter-refresh bersih
      window.location.href = "/";
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

        <h2 className={styles.title}>Selamat Datang Kembali</h2>
        <p className={styles.subtitle}>Masuk untuk melanjutkan belanja</p>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
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
                placeholder="Masukkan password"
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

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? <Loader2 size={20} className={styles.spinner} /> : null}
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className={styles.switchText}>
          Belum punya akun?{" "}
          <Link href="/daftar" className={styles.link}>Daftar sekarang</Link>
        </p>

        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali ke Toko
        </Link>
      </div>
    </div>
  );
}
