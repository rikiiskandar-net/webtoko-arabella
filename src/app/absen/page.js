"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LiquidLogin.module.css";
import { CheckCircle, Eye, EyeClosed, XCircle, HardHat } from "@phosphor-icons/react";

export default function WorkerLogin() {
  const router = useRouter();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  
  // States for forms
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", passwordConfirm: "", terms: false });
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showToast("Email dan password wajib diisi", "error");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/worker/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal masuk");

      router.push("/absen/dashboard");
      router.refresh();
    } catch (err) {
      showToast(err.message, "error");
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!regForm.name || !regForm.email || !regForm.password) {
      showToast("Data pendaftaran tidak lengkap", "error");
      return;
    }
    if (regForm.password !== regForm.passwordConfirm) {
      showToast("Konfirmasi sandi tidak cocok", "error");
      return;
    }
    if (!regForm.terms) {
      showToast("Anda harus menyetujui syarat & ketentuan", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/worker/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regForm.name, email: regForm.email, password: regForm.password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");

      router.push("/absen/dashboard");
      router.refresh();
    } catch (err) {
      showToast(err.message, "error");
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.scene}>
        <div className={`${styles.orb} ${styles['orb-1']}`} aria-hidden="true"></div>
        <div className={`${styles.orb} ${styles['orb-2']}`} aria-hidden="true"></div>
        <div className={`${styles.orb} ${styles['orb-3']}`} aria-hidden="true"></div>

        <main className={styles.card}>
          <div className={styles.logo}>
            <HardHat weight="fill" className={styles.icon} />
          </div>

          <div className={styles.heading}>
            <h1>{activeTab === 'login' ? 'Selamat datang' : 'Buat akun baru'}</h1>
            <p>{activeTab === 'login' ? 'Masuk untuk melanjutkan' : 'Isi data untuk mulai menggunakan'}</p>
          </div>

          <div className={styles.segmented} data-active={activeTab}>
            <span className={styles['segmented-thumb']} aria-hidden="true"></span>
            <button 
              type="button"
              className={styles['seg-btn']} 
              onClick={() => setActiveTab('login')} 
              aria-selected={activeTab === 'login'}
            >Masuk</button>
            <button 
              type="button"
              className={styles['seg-btn']} 
              onClick={() => setActiveTab('register')} 
              aria-selected={activeTab === 'register'}
            >Daftar</button>
          </div>

          {activeTab === 'login' && (
            <section className={styles.panel}>
              <form onSubmit={handleLogin} noValidate>
                <div className={styles.field}>
                  <label className={styles['field-label']}>Email</label>
                  <div className={styles['field-control']}>
                    <svg className={styles['field-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2.5"/>
                      <path d="M3.5 6.5 12 13l8.5-6.5"/>
                    </svg>
                    <input 
                      type="email" 
                      placeholder="nama@email.com" 
                      value={loginForm.email}
                      onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles['field-label']}>Kata sandi</label>
                  <div className={styles['field-control']}>
                    <svg className={styles['field-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="9" rx="2"/>
                      <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
                    </svg>
                    <input 
                      type={showLoginPass ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={loginForm.password}
                      onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      required 
                    />
                    <button type="button" className={styles['field-toggle']} onClick={() => setShowLoginPass(!showLoginPass)}>
                      {showLoginPass ? <Eye size={18} /> : <EyeClosed size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles['row-between']}>
                  <label className={styles['checkbox-row']}>
                    <input type="checkbox" />
                    Ingat saya
                  </label>
                  <button type="button" className={styles['link-plain']} onClick={() => showToast('Fitur ini belum aktif, hubungi Admin')}>Lupa sandi?</button>
                </div>

                <button type="submit" className={styles['btn-cta']} disabled={submitting}>
                  <span>{submitting ? "Memproses..." : "Masuk"}</span>
                  {!submitting && <svg className={styles.icon} style={{width:'18px', height:'18px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>}
                </button>

                <p className={styles['switch-line']}>Belum punya akun? <button type="button" className={styles['link-plain']} onClick={() => setActiveTab('register')}>Daftar</button></p>
              </form>
            </section>
          )}

          {activeTab === 'register' && (
            <section className={styles.panel}>
              <form onSubmit={handleRegister} noValidate>
                <div className={styles.field}>
                  <label className={styles['field-label']}>Nama lengkap</label>
                  <div className={styles['field-control']}>
                    <svg className={styles['field-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="3.4"/>
                      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Nama kamu" 
                      value={regForm.name}
                      onChange={e => setRegForm({...regForm, name: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles['field-label']}>Email</label>
                  <div className={styles['field-control']}>
                    <svg className={styles['field-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2.5"/>
                      <path d="M3.5 6.5 12 13l8.5-6.5"/>
                    </svg>
                    <input 
                      type="email" 
                      placeholder="nama@email.com" 
                      value={regForm.email}
                      onChange={e => setRegForm({...regForm, email: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles['field-label']}>Kata sandi</label>
                  <div className={styles['field-control']}>
                    <svg className={styles['field-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="9" rx="2"/>
                      <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
                    </svg>
                    <input 
                      type={showRegPass ? "text" : "password"} 
                      placeholder="Minimal 6 karakter" 
                      value={regForm.password}
                      onChange={e => setRegForm({...regForm, password: e.target.value})}
                      required 
                    />
                    <button type="button" className={styles['field-toggle']} onClick={() => setShowRegPass(!showRegPass)}>
                      {showRegPass ? <Eye size={18} /> : <EyeClosed size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles['field-label']}>Konfirmasi kata sandi</label>
                  <div className={styles['field-control']}>
                    <svg className={styles['field-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="9" rx="2"/>
                      <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
                    </svg>
                    <input 
                      type={showRegPass2 ? "text" : "password"} 
                      placeholder="Ulangi kata sandi" 
                      value={regForm.passwordConfirm}
                      onChange={e => setRegForm({...regForm, passwordConfirm: e.target.value})}
                      required 
                    />
                    <button type="button" className={styles['field-toggle']} onClick={() => setShowRegPass2(!showRegPass2)}>
                      {showRegPass2 ? <Eye size={18} /> : <EyeClosed size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles['row-between']} style={{justifyContent: 'flex-start'}}>
                  <label className={styles['checkbox-row']}>
                    <input type="checkbox" checked={regForm.terms} onChange={e => setRegForm({...regForm, terms: e.target.checked})} />
                    Saya setuju dengan Syarat & Ketentuan
                  </label>
                </div>

                <button type="submit" className={styles['btn-cta']} disabled={submitting}>
                  <span>{submitting ? "Memproses..." : "Buat akun"}</span>
                  {!submitting && <svg className={styles.icon} style={{width:'18px', height:'18px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>}
                </button>

                <p className={styles['switch-line']}>Sudah punya akun? <button type="button" className={styles['link-plain']} onClick={() => setActiveTab('login')}>Masuk</button></p>
              </form>
            </section>
          )}
        </main>
      </div>

      <div className={`${styles.toast} ${toast.visible ? styles.show : ''}`}>
        {toast.type === "error" ? <XCircle size={20} weight="fill" color="#FB7185" /> : <CheckCircle size={20} weight="fill" color="#34D399" />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
