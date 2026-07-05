"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Jangan lacak jika user sedang berada di halaman admin
    if (pathname?.startsWith("/dashboard")) return;
    
    // Jangan lacak berulang kali secara tidak perlu (bisa pakai session/localStorage jika mau lebih ketat)
    // Tapi karena kita ingin mencatat setiap page view, kita tembak setiap kali pathname berubah
    
    const trackView = async () => {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (err) {
        // Abaikan jika error (silent)
      }
    };

    // Tambahkan delay kecil agar tidak memblokir loading UI utama
    const timeout = setTimeout(trackView, 1000);
    return () => clearTimeout(timeout);
  }, [pathname]);

  // Komponen ini tidak merender apa-apa di layar
  return null;
}
