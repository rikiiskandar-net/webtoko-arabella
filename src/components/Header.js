/* eslint-disable @next/next/no-img-element */
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
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 75; // Tinggi header + sedikit ruang
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Promo", target: "promo-section" },
    { label: "Menu", target: "menu-section" },
    { label: "Tentang Kami", target: "tentang-kami" },
    { label: "Ulasan", target: "testimoni" },
    { label: "Kontak", target: "kontak" },
  ];

  return (
    <header ref={headerRef} className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
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
            <div className={styles.logoIconWrapper}>
              <img src="/images/logo.png" alt="Logo Dapur Arabella" className={styles.customLogoImg} />
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
