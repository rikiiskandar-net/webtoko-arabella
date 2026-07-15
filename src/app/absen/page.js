"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, HardHat } from "lucide-react";
import styles from "./Absen.module.css";

export default function WorkerLogin() {
  const router = useRouter();
  const [workers, setWorkers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/worker/list");
      const data = await res.json();
      if (res.ok) {
        setWorkers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!selectedUsername) {
      setError("Silakan pilih nama Anda");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/worker/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUsername, password: pin }),
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
      </div>
    );
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginHeader}>
        <div className={styles.iconCircle}>
          <HardHat size={32} color="#ffffff" />
        </div>
        <h1 className={styles.loginTitle}>Absen Proyek</h1>
        <p className={styles.loginSubtitle}>Silakan pilih nama dan masukkan PIN</p>
      </div>

      <form className={styles.loginForm} onSubmit={handleLogin}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label}>Pilih Nama</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} size={20} />
            <select 
              className={styles.selectInput}
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              required
            >
              <option value="" disabled>-- Daftar Pekerja --</option>
              {workers.map(w => (
                <option key={w.username} value={w.username}>{w.name} ({w.role})</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>PIN Keamanan</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={20} />
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="••••"
              className={styles.textInput}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? <Loader2 className={styles.spinnerSmall} size={20} /> : "Masuk & Absen"}
        </button>
      </form>
    </div>
  );
}
