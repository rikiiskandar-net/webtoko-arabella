"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SessionContext } from "@/lib/SessionContext";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        if (!data.authenticated) throw new Error("Unauthorized");
        setSession(data.user);
      })
      .catch(() => {
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      })
      .finally(() => setIsLoading(false));
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", backgroundColor: "#F8FAFC"
      }}>
        <Loader2 size={40} style={{ color: "#94A3B8", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!session) return null;

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
