"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Error caught:", error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: "2rem", textAlign: "center",
          fontFamily: "system-ui, sans-serif"
        }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
            Kesalahan Sistem Kritis
          </h1>
          <p style={{ color: "#64748B", marginBottom: "2rem" }}>
            Mohon maaf, terjadi kesalahan sistem. Silakan coba muat ulang halaman.
          </p>
          <button onClick={() => reset()} style={{
            padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none",
            background: "#F97316", color: "white", fontWeight: 600, cursor: "pointer"
          }}>
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
