"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Lab.module.css";
import {
  CheckCircle,
  Circle,
  Copy,
  Check,
  CaretLeft,
  CaretRight,
  TerminalWindow,
  BookOpen,
  Tag,
  ShieldCheck,
  House,
  Code,
  ArrowLeft
} from "@phosphor-icons/react";

// Mock Lab Chapters Dataset
const LAB_CHAPTERS = [
  {
    id: 1,
    bab: "BAB 1",
    title: "Etika & Legalitas Pentest",
    subtitle: "Landasan Hukum & Rules of Engagement",
    description: "Memahami batasan hukum, surat izin (Authorization Letter), serta etika profesional sebelum melakukan pengujian penetrasi pada target klien.",
    status: "Selesai",
    code: `# Contoh Surat Izin Penetration Testing (RoE)
ORGANISASI : PT Dapur Arabella Digital
TANGGAL    : 2026-07-25
SCOPE IP   : 192.168.1.0/24, *.arabella.web.id
IJIN       : EXPLICIT WRITTEN CONSENT AUTHORIZED`,
    tags: ["ethics", "compliance", "roe", "legal"],
  },
  {
    id: 2,
    bab: "BAB 2",
    title: "Setup Lab & Isolasi Docker",
    subtitle: "Isolasi Jaringan Docker di WSL2",
    description: "Bangun subnet khusus lab agar traffic pengujian target tidak bocor ke jaringan utama atau perangkat lain di jaringan lokal.",
    status: "Selesai",
    code: `docker network create --subnet=172.28.0.0/16 pentest-lab
docker run -d --net pentest-lab --name target-app -p 8080:80 vulnhub/web-app`,
    tags: ["docker", "network", "wsl2", "isolation"],
  },
  {
    id: 3,
    bab: "BAB 3",
    title: "Reconnaissance & Footprinting",
    subtitle: "Pengumpulan Informasi Pasif & Aktif",
    description: "Mengumpulkan data DNS, informasi WHOIS, sub-domain enumeration, serta pemetaan aset publik target tanpa memicu alarm IDS.",
    status: "Selesai",
    code: `nmap -sC -sV -oN scan_results.txt 172.28.0.2
subfinder -d targetdomain.com -silent | httpx -title -status-code`,
    tags: ["recon", "nmap", "subfinder", "dns"],
  },
  {
    id: 4,
    bab: "BAB 4",
    title: "Vulnerability Scanning",
    subtitle: "Identifikasi Celah Keamanan",
    description: "Melakukan pemindaian kerentanan berorientasi pada miskonfigurasi server, versi software out-of-date, serta rute API terbuka.",
    status: "Proses",
    code: `nikto -h http://172.28.0.2:8080 -Tuning 1,2,3,b
nuclei -u http://172.28.0.2:8080 -t cves/ -severity critical,high`,
    tags: ["scanning", "nuclei", "nikto", "cve"],
  },
  {
    id: 5,
    bab: "BAB 5",
    title: "Web Application Pentesting",
    subtitle: "Pengujian OWASP Top 10",
    description: "Menguji kerentanan aplikasi web seperti SQL Injection, Cross-Site Scripting (XSS), Broken Authentication, dan Insecure Direct Object References (IDOR).",
    status: "Belum",
    code: `sqlmap -u "http://172.28.0.2:8080/product?id=1" --batch --banner
ffuf -w wordlist.txt -u http://172.28.0.2:8080/FUZZ -mc 200,301`,
    tags: ["owasp", "sqlmap", "xss", "ffuf"],
  },
  {
    id: 6,
    bab: "BAB 6",
    title: "API Security & Token Audit",
    subtitle: "Analisis JWT & OAuth Flow",
    description: "Memeriksa tanda tangan JWT token, validasi expirations, eksploitasi algorithm none flaw, serta kebocoran endpoint API internal.",
    status: "Belum",
    code: `python3 -m jwt_tool <JWT_TOKEN> -X a
curl -H "Authorization: Bearer <EXPIRED_TOKEN>" http://localhost:3000/api/admin/credentials`,
    tags: ["api", "jwt", "auth", "oauth"],
  },
  {
    id: 7,
    bab: "BAB 7",
    title: "Privilege Escalation",
    subtitle: "Eskalasi Hak Akses Lokal",
    description: "Menganalisis miskonfigurasi sudoers, SUID permission binaries, serta eksploitasi kernel untuk menaikkan akses pengguna biasa menjadi root.",
    status: "Belum",
    code: `find / -perm -4000 -type f 2>/dev/null
sudo -l`,
    tags: ["privesc", "linux", "suid", "sudo"],
  },
  {
    id: 8,
    bab: "BAB 8",
    title: "Database Hardening & Encryption",
    subtitle: "Pengamanan PostgreSQL & Enkripsi AES-256",
    description: "Mengamankan kredensial tersimpan dengan enkripsi simetris AES-256-CBC, fallback legacy key, dan pembatasan akses database role.",
    status: "Belum",
    code: `// Prisma Encryption Middleware Checklist
const encryptedData = encryptData(sensitiveText, process.env.ENCRYPTION_KEY);
const decryptedData = decryptData(encryptedData, process.env.ENCRYPTION_KEY);`,
    tags: ["database", "prisma", "aes256", "postgresql"],
  },
  {
    id: 9,
    bab: "BAB 9",
    title: "Next.js Security Best Practices",
    subtitle: "Proteksi App Router & Middleware",
    description: "Menerapkan HTTP Security Headers (CSP, HSTS), proteksi CSRF, sanitasi input, serta kontrol akses ketat pada API Routes Next.js.",
    status: "Belum",
    code: `// middleware.js Authentication & Security Guard
export function middleware(request) {
  const token = request.cookies.get('worker_session');
  if (!token && request.nextUrl.pathname.startsWith('/absen/dashboard')) {
    return NextResponse.redirect(new URL('/absen', request.url));
  }
}`,
    tags: ["nextjs", "middleware", "csp", "security"],
  },
  {
    id: 10,
    bab: "BAB 10",
    title: "Reporting & Mitigation Guide",
    subtitle: "Penyusunan Laporan Hasil Audit",
    description: "Menyusun dokumen laporan penetration testing berstandar industri dengan rating CVSS, bukti eksploitasi (PoC), dan langkah mitigasi kode.",
    status: "Belum",
    code: `# Executive Summary & Risk Rating Matrix
[CRITICAL] SQL Injection on Search Parameter -> Remediation: Prepared Statements
[HIGH]     Broken Object Level Auth (IDOR)  -> Remediation: Strict Auth Guard Middleware`,
    tags: ["reporting", "cvss", "remediation", "poc"],
  }
];

export default function DigitalLabPage() {
  const [activeId, setActiveId] = useState(2); // Default BAB 2 - Setup lab
  const [completedIds, setCompletedIds] = useState([1, 2, 3]);
  const [copied, setCopied] = useState(false);

  const activeChapter = LAB_CHAPTERS.find(c => c.id === activeId) || LAB_CHAPTERS[0];
  const activeIndex = LAB_CHAPTERS.findIndex(c => c.id === activeId);

  const prevChapter = activeIndex > 0 ? LAB_CHAPTERS[activeIndex - 1] : null;
  const nextChapter = activeIndex < LAB_CHAPTERS.length - 1 ? LAB_CHAPTERS[activeIndex + 1] : null;

  const toggleComplete = (id) => {
    if (completedIds.includes(id)) {
      setCompletedIds(completedIds.filter(i => i !== id));
    } else {
      setCompletedIds([...completedIds, id]);
    }
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.wrapper}>
      {/* ===== HEADER NAVIGATION ===== */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backBtn} title="Kembali ke Beranda">
            <ArrowLeft size={18} weight="bold" />
          </Link>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerBadge}>
              <ShieldCheck size={16} weight="fill" /> DIGITAL LAB
            </div>
            <h1 className={styles.headerTitle}>Pembelajaranku & Documentation Hub</h1>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.themeTag}>
            💧 Liquid Glass Theme
          </span>
        </div>
      </header>

      {/* ===== MAIN CONTAINER ===== */}
      <div className={styles.mainContainer}>
        <div className={styles.glassGrid}>

          {/* ===== SIDEBAR KIRI: DAFTAR BAB ===== */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <BookOpen size={20} weight="fill" className={styles.sidebarIcon} />
              <h2 className={styles.sidebarTitle}>Daftar Modul Lab</h2>
            </div>

            <nav className={styles.chapterList}>
              {LAB_CHAPTERS.map((ch) => {
                const isActive = ch.id === activeId;
                const isCompleted = completedIds.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    className={`${styles.chapterItem} ${isActive ? styles.chapterItemActive : ""}`}
                    onClick={() => setActiveId(ch.id)}
                  >
                    <div className={styles.chapterItemLeft}>
                      <span
                        className={styles.checkIconBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(ch.id);
                        }}
                        title={isCompleted ? "Tandai Belum" : "Tandai Selesai"}
                      >
                        {isCompleted ? (
                          <CheckCircle size={18} weight="fill" className={styles.iconCheckGreen} />
                        ) : (
                          <Circle size={18} weight="bold" className={styles.iconCircleGray} />
                        )}
                      </span>
                      <div className={styles.chapterTextGroup}>
                        <span className={styles.chapterBabLabel}>{ch.bab}</span>
                        <span className={styles.chapterTitleLabel}>{ch.title}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Progress Bar Footer */}
            <div className={styles.progressFooter}>
              <div className={styles.progressTextRow}>
                <span>Kemajuan Belajar</span>
                <span className={styles.progressValue}>
                  {completedIds.length}/{LAB_CHAPTERS.length} Bab Selesai
                </span>
              </div>
              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${(completedIds.length / LAB_CHAPTERS.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </aside>

          {/* ===== PANEL KANAN: VIEWER KONTEN UTAMA ===== */}
          <main className={styles.contentViewer}>
            {/* Header Content */}
            <div className={styles.viewerHeader}>
              <div>
                <span className={styles.viewerSubtitle}>
                  {activeChapter.bab} &bull; {activeChapter.subtitle}
                </span>
                <h2 className={styles.viewerTitle}>{activeChapter.title}</h2>
              </div>
              <button
                className={`${styles.statusBadge} ${completedIds.includes(activeChapter.id) ? styles.statusBadgeDone : styles.statusBadgeTodo}`}
                onClick={() => toggleComplete(activeChapter.id)}
              >
                {completedIds.includes(activeChapter.id) ? (
                  <>
                    <CheckCircle size={16} weight="fill" /> Selesai
                  </>
                ) : (
                  <>
                    <Circle size={16} weight="bold" /> Tandai Selesai
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            <p className={styles.viewerDescription}>
              {activeChapter.description}
            </p>

            {/* Code Box Terminal */}
            <div className={styles.terminalBox}>
              <div className={styles.terminalHeader}>
                <div className={styles.terminalDots}>
                  <span className={styles.dotRed}></span>
                  <span className={styles.dotYellow}></span>
                  <span className={styles.dotGreen}></span>
                  <span className={styles.terminalTitle}>
                    <TerminalWindow size={16} weight="fill" /> Command / Script Lab
                  </span>
                </div>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyCode(activeChapter.code)}
                  title="Salin Kode"
                >
                  {copied ? (
                    <>
                      <Check size={14} weight="bold" color="#10B981" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className={styles.codeSnippet}>
                <code>{activeChapter.code}</code>
              </pre>
            </div>

            {/* Tag Pills */}
            <div className={styles.tagGroup}>
              <Tag size={16} weight="fill" className={styles.tagIcon} />
              {activeChapter.tags.map((tg) => (
                <span key={tg} className={styles.tagPill}>
                  {tg}
                </span>
              ))}
            </div>

            {/* Pagination Navigation Footer */}
            <div className={styles.paginationRow}>
              {prevChapter ? (
                <button
                  className={styles.pageBtn}
                  onClick={() => setActiveId(prevChapter.id)}
                >
                  <CaretLeft size={16} weight="bold" /> {prevChapter.bab} &bull; {prevChapter.title.split(" ")[0]}
                </button>
              ) : (
                <div></div>
              )}

              {nextChapter ? (
                <button
                  className={`${styles.pageBtn} ${styles.pageBtnNext}`}
                  onClick={() => setActiveId(nextChapter.id)}
                >
                  {nextChapter.bab} &bull; {nextChapter.title.split(" ")[0]} <CaretRight size={16} weight="bold" />
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
