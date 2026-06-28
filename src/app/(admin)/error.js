"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("Admin error boundary caught:", error);
  }, [error]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "4rem 2rem", textAlign: "center"
    }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", color: "#1E293B" }}>
        Terjadi Kesalahan
      </h2>
      <p style={{ color: "#64748B", marginBottom: "1.5rem" }}>
        Silakan coba lagi atau hubungi superadmin.
      </p>
      <button onClick={reset} style={{
        padding: "0.6rem 1.25rem", borderRadius: "8px", border: "none",
        background: "#3B82F6", color: "white", fontWeight: 600, cursor: "pointer"
      }}>
        Coba Lagi
      </button>
    </div>
  );
}
