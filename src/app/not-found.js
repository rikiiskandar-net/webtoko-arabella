import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", padding: "2rem", textAlign: "center",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "#1E293B" }}>
        Halaman tidak ditemukan
      </h1>
      <p style={{ color: "#64748B", marginBottom: "2rem", maxWidth: "400px" }}>
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link href="/" style={{
        padding: "0.75rem 1.5rem", borderRadius: "8px", border: "none",
        background: "#F97316", color: "white", fontWeight: 600, cursor: "pointer", textDecoration: "none"
      }}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
