"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";
import Image from "next/image";
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
    setCartItems([]);
    setDbCartCount(0);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  if (user === undefined) return <div className={styles.skeleton}></div>;

  // Cart Popup Element
  const renderCartPopup = () => (
    <div className={styles.cartWrapper} ref={cartRef} onMouseEnter={handleCartEnter} onMouseLeave={handleCartLeave}>
      <button onClick={() => setCartHover(!cartHover)} className={styles.cartBtn}>
        <ShoppingCart size={20} />
        {dbCartCount > 0 && <span className={styles.badge}>{dbCartCount}</span>}
      </button>

      {cartHover && (
        <div className={styles.cartPopup} onMouseEnter={handleCartEnter} onMouseLeave={handleCartLeave}>
          <div className={styles.cartPopupHeader}>
            <span className={styles.cartPopupTitle}>Keranjang Belanja</span>
            {dbCartCount > 0 && <span className={styles.cartPopupCount}>{dbCartCount} item</span>}
          </div>
          {cartItems.length === 0 ? (
            <div className={styles.cartPopupEmpty}>
              <ShoppingCart size={32} className={styles.cartPopupEmptyIcon} />
              <p>Keranjang Anda masih kosong</p>
            </div>
          ) : (
            <>
              <div className={styles.cartPopupList}>
                {cartItems.slice(0, 4).map(item => (
                  <div key={item.id} className={styles.cartPopupItem}>
                    <Image src={item.product?.image || "/images/placeholder.png"} alt={item.product?.name} className={styles.cartPopupImg} width={48} height={48} style={{ objectFit: 'cover' }} />
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
          <Link href="/keranjang" className={styles.cartPopupBtn} onClick={() => setCartHover(false)}>Lihat Keranjang</Link>
        </div>
      )}
    </div>
  );

  // Guest
  if (!user) {
    return (
      <div className={styles.guestNav}>
        {renderCartPopup()}
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

  return (
    <div className={styles.userNav} ref={dropdownRef}>
      {renderCartPopup()}

      <div className={styles.divider}></div>

      {/* User Avatar Dropdown */}
      <button className={styles.avatarBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
        {user.avatar ? (
          <Image src={user.avatar || "/images/placeholder.png"} alt={user.name} className={styles.avatarImg} width={34} height={34} style={{ objectFit: 'cover' }} />
        ) : (
          <div className={styles.avatarInitials}>{getInitials(user.name)}</div>
        )}
      </button>

      {dropdownOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownUserInfo}>
              <strong className={styles.dropdownName}>{user.name}</strong>
              <span className={styles.dropdownEmail}>{user.email}</span>
            </div>
          </div>
          
          <div className={styles.dropdownBody}>
            <Link href="/profil" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
              <div className={styles.dropdownIconWrap}>
                <User size={16} className={styles.dropdownIcon} />
              </div>
              <span className={styles.dropdownItemText}>Profil Saya</span>
            </Link>
            
            <Link href="/keranjang" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
              <div className={styles.dropdownIconWrap}>
                <ShoppingCart size={16} className={styles.dropdownIcon} />
              </div>
              <span className={styles.dropdownItemText}>Keranjang Belanja</span>
              {dbCartCount > 0 && <span className={styles.itemBadge}>{dbCartCount}</span>}
            </Link>
          </div>
          
          <div className={styles.dropdownFooter}>
            <button className={styles.dropdownLogout} onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.dropdownIcon}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
