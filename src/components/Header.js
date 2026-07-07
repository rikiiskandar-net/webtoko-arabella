/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, Flame, Grid, Coffee, Info, MessageSquare, Phone, HelpCircle, ChevronDown, Package } from "lucide-react";
import styles from "./Header.module.css";
import UserNav from "./UserNav";
import { renderIcon } from "@/app/(admin)/dashboard/categories/iconOptions";

export default function Header({ searchQuery, onSearchChange, categories = [], onCategoryClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 75;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleCategorySelect = (id) => {
    if (onCategoryClick) {
      onCategoryClick(id);
    } else {
      scrollTo("menu-section");
    }
    setIsMobileMenuOpen(false);
  };

  const navStructure = [
    { 
      label: "Promo Spesial", 
      type: "link", 
      target: "promo-section", 
      icon: Flame,
      highlight: true
    },
    { 
      label: "Semua Menu", 
      type: "dropdown", 
      icon: Grid,
      items: [
        { label: "Lihat Semua", id: "Semua", icon: Package },
        ...categories.map(c => ({
          label: c.name,
          id: c.id,
          rawIcon: c.icon
        }))
      ]
    },
    { 
      label: "Tentang Dapur", 
      type: "dropdown", 
      icon: Info,
      items: [
        { label: "Kisah Kami", target: "tentang-kami", icon: Info },
        { label: "Apa Kata Pelanggan", target: "testimoni", icon: MessageSquare }
      ]
    },
    { 
      label: "Bantuan", 
      type: "dropdown",
      icon: HelpCircle,
      items: [
        { label: "Hubungi Kami (WA)", target: "kontak", icon: Phone },
        { label: "Cara Pesan", target: "kontak", icon: HelpCircle }
      ]
    }
  ];

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <header ref={headerRef} className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <button
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          <div className={styles.logo} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className={styles.logoIconWrapper}>
              <div className={styles.logoIconInner}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                  <line x1="6" y1="17" x2="18" y2="17"/>
                </svg>
              </div>
            </div>
            <div className={styles.logoTextWrapper}>
              <h1 className={styles.title}>Arabella</h1>
              <span className={styles.subtitle}>Dapur & Katering</span>
            </div>
          </div>

          <nav className={styles.navLinks}>
            {navStructure.map((nav, idx) => {
              const Icon = nav.icon;
              if (nav.type === "link") {
                return (
                  <button key={idx} className={`${styles.navLink} ${nav.highlight ? styles.navLinkHighlight : ""}`} onClick={() => scrollTo(nav.target)}>
                    {Icon && <Icon size={18} className={styles.navIcon} />}
                    {nav.label}
                  </button>
                );
              }
              
              return (
                <div key={idx} className={styles.navItemContainer}>
                  <button className={styles.navLink}>
                    {Icon && <Icon size={18} className={styles.navIcon} />}
                    {nav.label}
                    <ChevronDown size={16} className={styles.chevron} />
                  </button>
                  <div className={styles.dropdownMenu}>
                    {nav.items.map((item, i) => {
                      const SubIcon = item.icon;
                      return (
                        <button 
                          key={i} 
                          className={styles.dropdownItem} 
                          onClick={() => item.id ? handleCategorySelect(item.id) : scrollTo(item.target)}
                        >
                          <div className={styles.dropdownIcon}>
                            {item.rawIcon ? renderIcon(item.rawIcon, 16, true) : (SubIcon && <SubIcon size={16} />)}
                          </div>
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
                placeholder="Cari camilan..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <UserNav />
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}>
          <div className={styles.mobileMenuContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileMenuHeader}>
              <div className={styles.logo} onClick={() => { scrollTo("top"); setIsMobileMenuOpen(false); }}>
                <div className={styles.logoIconWrapper}>
                  <div className={styles.logoIconInner}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                      <line x1="6" y1="17" x2="18" y2="17"/>
                    </svg>
                  </div>
                </div>
                <div className={styles.logoTextWrapper}>
                  <h1 className={styles.title} style={{ fontSize: "1.1rem" }}>Arabella</h1>
                </div>
              </div>
              <button className={styles.closeMobileMenu} onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.mobileNavContent}>
              {navStructure.map((nav, idx) => {
                const Icon = nav.icon;
                const isActive = activeAccordion === idx;
                
                if (nav.type === "link") {
                  return (
                    <div key={idx} className={styles.mobileNavItem}>
                      <button 
                        className={`${styles.mobileNavLink} ${nav.highlight ? styles.mobileNavLinkHighlight : ""}`}
                        onClick={() => scrollTo(nav.target)}
                      >
                        <div className={styles.mobileNavLinkLeft}>
                          {Icon && <Icon size={20} />}
                          {nav.label}
                        </div>
                      </button>
                    </div>
                  );
                }
                
                return (
                  <div key={idx} className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ""}`}>
                    <button className={styles.mobileNavLink} onClick={() => toggleAccordion(idx)}>
                      <div className={styles.mobileNavLinkLeft}>
                        {Icon && <Icon size={20} />}
                        {nav.label}
                      </div>
                      <ChevronDown size={18} style={{ transform: isActive ? "rotate(180deg)" : "rotate(0)", transition: "0.3s" }} />
                    </button>
                    
                    {isActive && (
                      <div className={styles.mobileDropdownContent}>
                        {nav.items.map((item, i) => (
                          <button 
                            key={i} 
                            className={styles.mobileDropdownItem}
                            onClick={() => item.id ? handleCategorySelect(item.id) : scrollTo(item.target)}
                          >
                            {item.rawIcon ? renderIcon(item.rawIcon, 16, true) : (item.icon && <item.icon size={16} />)}
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

