"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, HardHat } from "lucide-react";
import Link from "next/link";
import styles from "./Absen.module.css";

export default function WorkerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/worker/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      router.push("/absen/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginHeader}>
        <div className={styles.iconCircle}>
          <HardHat size={32} color="#ffffff" />
        </div>
        <h1 className={styles.loginTitle}>Absen Proyek</h1>
        <p className={styles.loginSubtitle}>Silakan login untuk mencatat kehadiran</p>
      </div>

      <form className={styles.loginForm} onSubmit={handleLogin}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} size={20} />
            <input
              type="email"
              placeholder="nama@email.com"
              className={styles.textInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="password"
              placeholder="••••••••"
              className={styles.textInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? <Loader2 className={styles.spinnerSmall} size={20} /> : "Masuk & Absen"}
        </button>
        
        <div className={styles.registerPrompt}>
          Belum punya akun? <Link href="/absen/register" className={styles.registerLink}>Daftar di sini</Link>
        </div>
      </form>
    </div>
  );
}
