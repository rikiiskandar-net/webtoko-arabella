"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Mail, Loader2, HardHat } from "lucide-react";
import Link from "next/link";
import styles from "../Absen.module.css";

export default function WorkerRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/worker/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftar");
      }

      // Automatically login after register
      const loginRes = await fetch("/api/worker/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (loginRes.ok) {
        router.push("/absen/dashboard");
        router.refresh();
      } else {
        // If auto-login fails, redirect to login page
        router.push("/absen");
      }
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
        <h1 className={styles.loginTitle}>Daftar Pekerja</h1>
        <p className={styles.loginSubtitle}>Buat akun untuk mencatat kehadiran</p>
      </div>

      <form className={styles.loginForm} onSubmit={handleRegister}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label}>Nama Lengkap</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} size={20} />
            <input
              type="text"
              placeholder="Nama Lengkap Anda"
              className={styles.textInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={20} />
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
              placeholder="Minimal 6 karakter"
              className={styles.textInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Konfirmasi Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="password"
              placeholder="Ulangi password di atas"
              className={styles.textInput}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? <Loader2 className={styles.spinnerSmall} size={20} /> : "Daftar Sekarang"}
        </button>
        
        <div className={styles.registerPrompt}>
          Sudah punya akun? <Link href="/absen" className={styles.registerLink}>Masuk di sini</Link>
        </div>
      </form>
    </div>
  );
}
