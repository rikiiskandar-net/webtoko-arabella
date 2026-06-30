"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Tags, LogOut, Settings, Shield, ImageIcon, ClipboardList, Menu, X, Info } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useSession } from "@/lib/SessionContext";
import styles from "./AdminLayout.module.css";
import { useState, useEffect } from "react";

function AdminSidebar({ pathname, router }) {
  const session = useSession();

  const allNavItems = [
    { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pesanan", href: "/dashboard/orders", icon: ClipboardList },
    { name: "Produk Menu", href: "/dashboard/products", icon: Package },
    { name: "Kategori", href: "/dashboard/categories", icon: Tags },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
    { name: "Tentang Kami", href: "/dashboard/about", icon: Info },
    { name: "Banner", href: "/dashboard/banners", icon: ImageIcon },
    { name: "Admin", href: "/dashboard/admins", icon: Shield, superadminOnly: true },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.superadminOnly || session?.role === "superadmin"
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#60A5FA" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className={styles.brandName}>Dapur Arabella</span>
      </div>

      <nav className={styles.navMenu}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </>
  );
}

function AdminContent({ children, onMenuClick }) {
  const session = useSession();
  const initial = session?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className={styles.mainContent}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button className={styles.mobileMenuBtn} onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <h1 className={styles.pageTitle}>Kokpit Admin</h1>
        </div>
        <div className={styles.userProfile}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.9rem", color: "#0F172A", fontWeight: 600 }}>{session?.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
              {session?.role === "superadmin" ? "Superadmin" : "Admin"}
            </div>
          </div>
          <div className={styles.avatar}>{initial}</div>
        </div>
      </header>
      <main className={styles.contentArea}>{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <AuthGuard>
      <div className={styles.adminWrapper}>
        {isSidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
        )}
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarMobileHeader}>
            <button className={styles.closeSidebarBtn} onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <AdminSidebar pathname={pathname} router={router} />
        </aside>
        <AdminContent onMenuClick={() => setIsSidebarOpen(true)}>
          {children}
        </AdminContent>
      </div>
    </AuthGuard>
  );
}
