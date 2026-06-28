"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import styles from "./Header.module.css";

export default function Header({ searchQuery, onSearchChange, cartItemCount, onCartClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const prevCount = useRef(cartItemCount);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (cartItemCount > prevCount.current) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 400);
      prevCount.current = cartItemCount;
      return () => clearTimeout(timer);
    }
    prevCount.current = cartItemCount;
  }, [cartItemCount]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Menu", target: "menu-section" },
    { label: "Promo", target: "promo-section" },
    { label: "Kontak", target: "kontak" },
  ];

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <button
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#logoGrad)" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className={styles.title}>Dapur Arabella</h1>
          </div>

          <nav className={styles.navLinks}>
            {navLinks.map((link) => (
              <button key={link.target} className={styles.navLink} onClick={() => scrollTo(link.target)}>
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.right}>
          <div className={`${styles.searchContainer} ${isMobileSearchOpen ? styles.mobileSearchOpen : ""}`}>
            <button className={styles.mobileSearchToggle} onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
              <Search size={22} />
            </button>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cari produk lezat..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <button className={`${styles.cartBtn} ${cartBounce ? styles.cartBounce : ""}`} onClick={onCartClick}>
            <ShoppingCart size={20} />
            {cartItemCount > 0 && <span className={styles.badge}>{cartItemCount}</span>}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <button key={link.target} className={styles.mobileNavLink} onClick={() => scrollTo(link.target)}>
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
