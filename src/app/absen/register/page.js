"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react";
import styles from "../Absen.module.css";

export default function WorkerRegister() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!name || !email || !password) {
      setError("Semua bidang wajib diisi");
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

      router.push("/absen/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.googlePage}>
      <div className={styles.googleCard}>
        <div className={styles.googleLogoContainer}>
          <svg viewBox="0 0 74 24" width="74" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.4 18.6c-5.4 0-9.4-4.1-9.4-9.3s4-9.3 9.4-9.3c3 0 5.1 1.2 6.8 2.8l-1.9 1.9c-1.2-1.1-2.8-2-4.9-2-4.1 0-7.3 3.4-7.3 7.5s3.2 7.5 7.3 7.5c2.4 0 4.1-1 5-1.9 1.5-1.5 1.9-3.2 1.9-5.4H9.4v-2.8h9.8c.1.5.1 1.1.1 1.7 0 2.2-.6 4.7-2.1 6.5-1.5 1.8-3.5 2.8-5.8 2.8z" fill="#4285f4"></path>
            <path d="M22 12.8c0 3.2-2.5 5.8-5.6 5.8s-5.6-2.6-5.6-5.8 2.5-5.8 5.6-5.8 5.6 2.6 5.6 5.8zm-2.8 0c0-2.1-1.4-3.5-2.8-3.5-1.4 0-2.8 1.4-2.8 3.5s1.4 3.5 2.8 3.5c1.4 0 2.8-1.4 2.8-3.5z" fill="#ea4335"></path>
            <path d="M34.4 12.8c0 3.2-2.5 5.8-5.6 5.8s-5.6-2.6-5.6-5.8 2.5-5.8 5.6-5.8 5.6 2.6 5.6 5.8zm-2.8 0c0-2.1-1.4-3.5-2.8-3.5-1.4 0-2.8 1.4-2.8 3.5s1.4 3.5 2.8 3.5c1.4 0 2.8-1.4 2.8-3.5z" fill="#fbbc05"></path>
            <path d="M45.5 7.3v10.8c0 4.4-2.7 6.2-5.4 6.2-2.7 0-4.3-1.8-4.9-3.3l2.4-1c.4 1 1.4 2 2.5 2 1.8 0 2.9-1.1 2.9-3.2v-1h-.1c-.6.7-1.7 1.3-3 1.3-2.9 0-5.5-2.5-5.5-5.8s2.6-5.8 5.5-5.8c1.3 0 2.4.6 3 1.3h.1v-1h2.7zm-2.5 5.5c0-2.1-1.4-3.5-2.8-3.5-1.5 0-2.8 1.5-2.8 3.5 0 2.1 1.3 3.5 2.8 3.5 1.4 0 2.8-1.4 2.8-3.5z" fill="#4285f4"></path>
            <path d="M50.4 1.1v17.4h-2.8v-17.4h2.8z" fill="#34a853"></path>
            <path d="M60.1 14.5l2.2 1.5c-.7 1-1.9 2.6-4.6 2.6-3 0-5.4-2.4-5.4-5.8 0-3.3 2.5-5.8 5.2-5.8 2.7 0 4.1 1.6 4.6 2.5l.3.7-6.2 2.6c.5.9 1.4 1.5 2.6 1.5 1.1 0 1.9-.6 2.4-1.3zm-3.8-3.8l3.4-1.4c-.2-.5-.8-.8-1.4-.8-1.1 0-2.5.8-3 2.2z" fill="#ea4335"></path>
          </svg>
        </div>
        <h1 className={styles.googleTitle}>Buat Akun Google</h1>
        <p className={styles.googleSubtitle}>Masukkan nama Anda</p>

        <form className={styles.googleForm} onSubmit={handleRegister}>
          {error && (
            <div className={styles.googleError}>
              <WarningCircle size={16} weight="fill" />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.googleInputGroup}>
            <input
              type="text"
              className={styles.googleInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              required
            />
            <label className={styles.googleLabel}>Nama depan & belakang</label>
          </div>

          <div className={styles.googleInputGroup}>
            <input
              type="email"
              className={styles.googleInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label className={styles.googleLabel}>Alamat email</label>
          </div>

          <div className={styles.googleInputGroup}>
            <input
              type="password"
              className={styles.googleInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label className={styles.googleLabel}>Sandi</label>
          </div>
          
          <p style={{ fontSize: '12px', color: '#444746', marginTop: '-12px', marginBottom: '24px', lineHeight: '1.4' }}>
            Gunakan minimal 8 karakter dengan campuran huruf, angka & simbol.
          </p>

          <div className={styles.googleActions}>
            <Link href="/absen" className={styles.googleBtnSecondary}>
              Login saja
            </Link>
            <button type="submit" className={styles.googleBtnPrimary} disabled={submitting}>
              {submitting ? "Memuat..." : "Selanjutnya"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
