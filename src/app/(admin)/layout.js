"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Tags, LogOut, Settings, Shield, ImageIcon, ClipboardList, Menu, X, Info, FolderOpen, Users, User, HelpCircle, ChevronLeft, ChevronRight, Moon, Sun, BookOpen, HardHat } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useSession } from "@/lib/SessionContext";
import { useTheme } from "@/components/ThemeProvider";
import styles from "./AdminLayout.module.css";
import { useState, useEffect, useRef } from "react";

function AdminSidebar({ pathname, router, isSidebarCollapsed, onToggleCollapse }) {
  const session = useSession();

  const menuGroups = [
    {
      label: "WEBTOKO (TOKO ONLINE)",
      items: [
        { name: "Dashboard Toko", href: "/dashboard", icon: LayoutDashboard },
        { name: "Pesanan", href: "/dashboard/orders", icon: ClipboardList },
        { name: "Katalog Produk", href: "/dashboard/products", icon: Package },
        { name: "Kategori", href: "/dashboard/categories", icon: Tags },
        { name: "Pelanggan", href: "/dashboard/users", icon: Users },
        { name: "Buku Kas", href: "/dashboard/cashbook", icon: BookOpen },
      ]
    },
    {
      label: "KONTEN WEB",
      items: [
        { name: "Banner", href: "/dashboard/banners", icon: ImageIcon },
        { name: "Galeri Media", href: "/dashboard/media", icon: FolderOpen },
        { name: "Tentang Kami", href: "/dashboard/about", icon: Info },
      ]
    },
    {
      label: "ABSENKU (SISTEM PEKERJA)",
      items: [
        { name: "Pekerja Proyek", href: "/dashboard/workers", icon: HardHat },
        { name: "Data Absensi & Gaji", href: "/dashboard/attendance", icon: BookOpen },
      ]
    },
    {
      label: "MANAJEMEN SISTEM",
      items: [
        { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
        { name: "Data Admin", href: "/dashboard/admins", icon: Shield, superadminOnly: true },
      ]
    }
  ];

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
        <button 
          className={styles.collapseDesktopBtn} 
          onClick={onToggleCollapse}
          title={isSidebarCollapsed ? "Munculkan Sidebar" : "Lipat Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={styles.navMenu}>
        {menuGroups.map((group, idx) => {
          const visibleItems = group.items.filter(
            (item) => !item.superadminOnly || session?.role === "superadmin"
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className={styles.menuGroup}>
              <span className={styles.groupLabel}>{group.label}</span>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  >
                    <Icon size={20} />
                    <span className={styles.navText}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );
}

function AdminContent({ children, onToggleSidebar, router }) {
  const session = useSession();
  const { theme, toggleTheme } = useTheme();
  const initial = session?.name?.charAt(0)?.toUpperCase() || "A";
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (e) => {
    e.stopPropagation();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className={styles.mainContent}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button className={styles.mobileMenuBtn} onClick={onToggleSidebar}>
            <Menu size={24} />
          </button>
          <h1 className={styles.pageTitle}>Kokpit Admin</h1>
        </div>
        
        <div className={styles.topbarRight}>
          <button 
            className={styles.themeToggleBtn} 
            onClick={toggleTheme}
            title="Toggle Dark Mode"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div 
            className={styles.userProfile} 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            ref={dropdownRef}
          >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 600 }}>{session?.name}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {session?.role === "superadmin" ? "Superadmin" : "Admin"}
            </div>
          </div>
          <div className={styles.avatar}>{initial}</div>

          {isProfileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownHeaderName}>{session?.name}</div>
                <div className={styles.dropdownHeaderRole}>{session?.email || "Admin Account"}</div>
              </div>
              <Link href="/dashboard/settings" className={styles.dropdownItem}>
                <User size={18} /> Profil Saya
              </Link>
              <Link href="#" className={styles.dropdownItem}>
                <HelpCircle size={18} /> Pusat Bantuan
              </Link>
              <div className={styles.dropdownDivider}></div>
              <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleLogout}>
                <LogOut size={18} /> Keluar
              </button>
            </div>
          )}
        </div>
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auto-close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <AuthGuard>
      <div className={styles.adminWrapper}>
        {isSidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
        )}
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""} ${isSidebarCollapsed ? styles.collapsed : ""}`}>
          <div className={styles.sidebarMobileHeader}>
            <button className={styles.closeSidebarBtn} onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <AdminSidebar 
            pathname={pathname} 
            router={router} 
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </aside>
        <AdminContent onToggleSidebar={handleToggleSidebar} router={router}>
          {children}
        </AdminContent>
      </div>
    </AuthGuard>
  );
}
