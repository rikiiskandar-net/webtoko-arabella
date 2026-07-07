"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";
import styles from "./UserNav.module.css";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [cartItems, setCartItems] = useState([]);
  const [dbCartCount, setDbCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartHover, setCartHover] = useState(false);
  const dropdownRef = useRef(null);
  const cartRef = useRef(null);
  const cartHoverTimeout = useRef(null);

  const fetchCart = () => {
    fetch("/api/cart")
      .then(r => r.ok ? r.json() : [])
      .then(items => {
        if (Array.isArray(items)) {
          setCartItems(items);
          const total = items.reduce((a, i) => a + i.quantity, 0);
          setDbCartCount(total);
        }
      })
      .catch(() => { setCartItems([]); setDbCartCount(0); });
  };

  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(data);
        if (data) fetchCart();
      })
      .catch(() => setUser(null));

    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartHover(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCartEnter = () => {
    clearTimeout(cartHoverTimeout.current);
    setCartHover(true);
  };
  const handleCartLeave = () => {
    cartHoverTimeout.current = setTimeout(() => setCartHover(false), 200);
  };

  const handleLogout = async () => {
    await fetch("/api/user/logout", { method: "POST" });
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  if (user === undefined) return <div className={styles.skeleton}></div>;

  // Guest
  if (!user) {
    return (
      <div className={styles.guestNav}>
        <Link href="/keranjang" className={styles.cartBtn}><ShoppingCart size={20} /></Link>
        <div className={styles.divider}></div>
        <div className={styles.authGroup}>
          <Link href="/masuk" className={styles.btnMasuk}>Masuk</Link>
          <Link href="/daftar" className={styles.btnDaftar}>Daftar</Link>
        </div>
        <Link href="/masuk" className={styles.mobileLoginBtn} aria-label="Masuk">
          <User size={22} />
        </Link>
      </div>
    );
  }

  // Logged in
  const previewItems = cartItems.slice(0, 4);

  return (
    <div className={styles.userNav} ref={dropdownRef}>
      {/* Cart Button with Hover Preview */}
      <div className={styles.cartWrapper} ref={cartRef} onMouseEnter={handleCartEnter} onMouseLeave={handleCartLeave}>
        <Link href="/keranjang" className={styles.cartBtn}>
          <ShoppingCart size={20} />
          {dbCartCount > 0 && <span className={styles.badge}>{dbCartCount}</span>}
        </Link>

        {/* Cart Hover Popup */}
        {cartHover && (
          <div className={styles.cartPopup} onMouseEnter={handleCartEnter} onMouseLeave={handleCartLeave}>
            <div className={styles.cartPopupHeader}>
              <span className={styles.cartPopupTitle}>Keranjang Belanja</span>
              {dbCartCount > 0 && <span className={styles.cartPopupCount}>{dbCartCount} item</span>}
            </div>
            {previewItems.length === 0 ? (
              <div className={styles.cartPopupEmpty}>
                <ShoppingCart size={32} className={styles.cartPopupEmptyIcon} />
                <p>Keranjang Anda masih kosong</p>
              </div>
            ) : (
              <>
                <div className={styles.cartPopupList}>
                  {previewItems.map(item => (
                    <div key={item.id} className={styles.cartPopupItem}>
                      <img src={item.product?.image || "/images/placeholder.png"} alt={item.product?.name} className={styles.cartPopupImg} />
                      <div className={styles.cartPopupInfo}>
                        <span className={styles.cartPopupName}>{item.product?.name}</span>
                        <span className={styles.cartPopupMeta}>{item.quantity}x {formatRp(item.product?.price || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {cartItems.length > 4 && (
                  <div className={styles.cartPopupMore}>+{cartItems.length - 4} item lainnya</div>
                )}
              </>
            )}
            <Link href="/keranjang" className={styles.cartPopupBtn}>Lihat Keranjang</Link>
          </div>
        )}
      </div>

      <div className={styles.divider}></div>

      {/* User Avatar Dropdown */}
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
