"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", padding: "2rem", textAlign: "center",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#1E293B" }}>
        Ada yang tidak beres
      </h1>
      <p style={{ color: "#64748B", marginBottom: "2rem", maxWidth: "400px" }}>
        Maaf, terjadi kesalahan. Tim kami sudah mendapat notifikasi.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button onClick={reset} style={{
          padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none",
          background: "#F97316", color: "white", fontWeight: 600, cursor: "pointer"
        }}>
          Coba Lagi
        </button>
        <Link href="/" style={{
          padding: "0.75rem 1.5rem", borderRadius: "8px", border: "1px solid #E2E8F0",
          background: "white", color: "#1E293B", fontWeight: 600, textDecoration: "none"
        }}>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
