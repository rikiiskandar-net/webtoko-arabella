"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import styles from "./UserNav.module.css";

// Helper inisial nama
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // undefined = loading
  const [dbCartCount, setDbCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchCartCount = () => {
    fetch("/api/cart")
      .then(r => r.ok ? r.json() : [])
      .then(items => {
        const total = items.reduce((a, i) => a + i.quantity, 0);
        setDbCartCount(total);
      })
      .catch(() => setDbCartCount(0));
  };

  useEffect(() => {
    // Cek status login user
    fetch("/api/user/profile")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        if (data) {
          fetchCartCount();
        }
      })
      .catch(() => setUser(null));

    // Listen untuk event tambah ke keranjang
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    // Tutup dropdown jika klik di luar
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  // Loading state
  if (user === undefined) {
    return <div className={styles.skeleton}></div>;
  }

  // Belum login
  if (!user) {
    return (
      <div className={styles.guestNav}>
        <Link href="/keranjang" className={styles.cartBtn}>
          <ShoppingCart size={20} />
        </Link>
        <div className={styles.divider}></div>
        <div className={styles.authGroup}>
          <Link href="/masuk" className={styles.btnMasuk}>Masuk</Link>
          <Link href="/daftar" className={styles.btnDaftar}>Daftar</Link>
        </div>
      </div>
    );
  }

  // Sudah login
  return (
    <div className={styles.userNav} ref={dropdownRef}>
      <Link href="/keranjang" className={styles.cartBtn}>
        <ShoppingCart size={20} />
        {dbCartCount > 0 && <span className={styles.badge}>{dbCartCount}</span>}
      </Link>
      
      <div className={styles.divider}></div>

      <button className={styles.avatarBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarInitials}>{getInitials(user.name)}</div>
        )}
        <span className={styles.userName}>{user.name.split(" ")[0]}</span>
        <span className={styles.chevron}>{dropdownOpen ? "▲" : "▼"}</span>
      </button>

      {dropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <Link href="/profil" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            👤 Profil Saya
          </Link>
          <Link href="/keranjang" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShoppingCart size={16} /> Keranjang Belanja
            </div>
            {dbCartCount > 0 && <span className={styles.itemBadge}>{dbCartCount}</span>}
          </Link>
          <button className={styles.dropdownLogout} onClick={handleLogout}>
            🚪 Keluar
          </button>
        </div>
      )}
    </div>
  );
}
