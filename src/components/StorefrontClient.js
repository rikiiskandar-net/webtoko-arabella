"use client";

import { useState, useEffect } from "react";
import styles from "@/app/page.module.css";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import TrustBadges from "@/components/TrustBadges";
import MenuHariIni from "@/components/MenuHariIni";
import ProductCard from "@/components/ProductCard";
import Toast from "@/components/Toast";
import dynamic from "next/dynamic";

const AboutUs = dynamic(() => import("@/components/AboutUs"), { ssr: true });
const Gallery = dynamic(() => import("@/components/Gallery"), { ssr: true });
const Testimonial = dynamic(() => import("@/components/Testimonial"), { ssr: true });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
import { Flame, Star, Sparkles } from "lucide-react";
import { renderIcon } from "@/app/(admin)/dashboard/categories/iconOptions";

export default function StorefrontClient({ initialProducts = [], initialCategories = [], storeConfig, initialBanners = [] }) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  const promoProducts = initialProducts.filter(p => p.isPromo);
  const bestsellerProducts = initialProducts.slice(0, 4);
  const newProducts = initialProducts.slice(-4).reverse();
  
  const [activeRekomendasiTab, setActiveRekomendasiTab] = useState(
    promoProducts.length > 0 ? "promo" : (bestsellerProducts.length > 0 ? "terlaris" : "terbaru")
  );
  
  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);



  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  const handleUpdateQuantity = async (productId, change, productName, variants = []) => {
    // Hanya bisa tambah 1 dari tombol "Tambah" di halaman depan
    if (change > 0) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity: change, variants }),
        });
        
        if (res.status === 401) {
          // Belum login, arahkan ke halaman masuk
          window.location.href = "/masuk";
          return;
        }

        if (res.ok && productName) {
          showToast(`${productName} ditambahkan ke keranjang`);
          // Trigger UserNav untuk merender ulang badge dengan dispatch custom event
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch (error) {
        console.error("Gagal menambah keranjang", error);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBuyNow = async (productId, selectedVariants = []) => {
    setIsCheckingOut(true);
    let orderId = null;
    const product = initialProducts.find(p => p.id === productId);
    
    if (product) {
      try {
        const payload = {
          items: [{
            id: product.id,
            qty: 1,
            variants: selectedVariants
          }]
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          orderId = data.orderId;
        } else {
          console.error("Gagal menyimpan pesanan dari beranda ke database");
        }
      } catch (err) {
        console.error("Error saving order from storefront:", err);
      } finally {
        setIsCheckingOut(false);
      }
    } else {
      setIsCheckingOut(false);
      return;
    }

    let variantText = "";
    let extraPrice = 0;
    
    if (selectedVariants && selectedVariants.length > 0) {
      variantText = " (" + selectedVariants.map(v => `${v.groupName}: ${v.optionName}`).join(", ") + ")";
      extraPrice = selectedVariants.reduce((sum, v) => sum + (v.priceMod || 0), 0);
    }

    const finalPrice = product.price + extraPrice;

    let message = "Halo Dapur Arabella, saya mau pesan:\n\n";
    message += `- 1x ${product.name}${variantText} (@ ${formatPrice(finalPrice)})\n`;
    message += `\n*Total: ${formatPrice(finalPrice)}*\n`;
    
    if (orderId) {
      message += `\nRef: #${orderId.split('-')[0].toUpperCase()}\n`;
    }
    
    message += `\nMohon info untuk pembayaran dan pengiriman ya. Terima kasih!`;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = storeConfig?.waNumber || "6281234567890";
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    // Beri jeda sedikit agar React selesai merender perubahan DOM
    setTimeout(() => {
      const anchor = document.getElementById("category-anchor");
      if (anchor) {
        // Hitung koordinat Y absolut dari elemen jangkar (anchor) di dalam dokumen
        const absoluteY = anchor.getBoundingClientRect().top + window.scrollY;
        
        // Scroll ke koordinat Y tersebut, dikurangi 64px agar tidak tertutup header yang fixed
        window.scrollTo({
          top: absoluteY - 64, 
          behavior: "smooth"
        });
      }
    }, 50);
  };

  const filteredProducts = initialProducts.filter(product => {
    const matchesCategory = activeCategory === "Semua" || product.categoryId === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isDefaultView = searchQuery === "" && activeCategory === "Semua";

  const renderProductGrid = (items, isSmall = false, isCarousel = false) => (
    <div className={isCarousel ? styles.rekomendasiCarousel : (isSmall ? styles.smallProductGrid : styles.productGrid)}>
      {items.map(product => (
        <div key={product.id}>
          <ProductCard 
            product={product} 
            cartQuantity={0}
            onUpdateQuantity={handleUpdateQuantity}
            onBuyNow={handleBuyNow}
            isSmall={isSmall}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={initialCategories}
        onCategoryClick={handleCategoryClick}
      />
      
      <main className={styles.main}>
        
        {isDefaultView && (
          <>
            <HeroBanner initialBanners={initialBanners} />
            <TrustBadges />
            <MenuHariIni />
          </>
        )}

        <div id="category-anchor"></div>
        <div id="menu-section" className={`${styles.categoryContainer} hide-scrollbar`}>
          <button 
            className={`${styles.categoryPill} ${activeCategory === "Semua" ? styles.activePill : ""}`}
            onClick={() => handleCategoryClick("Semua")}
          >
            <span className={styles.categoryIcon}>🍽️</span>
            Semua Menu
          </button>
          {initialCategories.map(category => (
            <button 
              key={category.id}
              className={`${styles.categoryPill} ${activeCategory === category.id ? styles.activePill : ""}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className={styles.categoryIcon}>{renderIcon(category.icon, 18, true) || category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        {!isDefaultView ? (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {searchQuery ? "Hasil Pencarian" : `Kategori Pilihan`}
            </h3>
            {filteredProducts.length > 0 ? (
              renderProductGrid(filteredProducts, false)
            ) : (
              <div className={styles.noResults}>
                <p>Produk tidak ditemukan.</p>
              </div>
            )}
          </section>
        ) : (
          <>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Semua Produk</h3>
              {initialProducts.length > 0 ? (
                renderProductGrid(initialProducts, false)
              ) : (
                <div className={styles.noResults}>
                  <p>Belum ada produk. Silakan tambahkan dari halaman Admin.</p>
                </div>
              )}
            </section>
            
            {initialProducts.length > 0 && <div className={styles.divider}></div>}
            
            {(promoProducts.length > 0 || bestsellerProducts.length > 0 || newProducts.length > 0) && (
              <div className={styles.rekomendasiWrapper}>
                <h2 className={styles.subHeading} style={{ marginBottom: '1rem' }}>Rekomendasi Pilihan</h2>
                
                <div className={`${styles.rekomendasiTabs} hide-scrollbar`}>
                  {promoProducts.length > 0 && (
                    <button 
                      className={`${styles.rekomTab} ${activeRekomendasiTab === 'promo' ? styles.rekomTabActive : ''}`}
                      onClick={() => setActiveRekomendasiTab('promo')}
                    >
                      <Flame size={16} strokeWidth={2.5} color={activeRekomendasiTab === 'promo' ? "#FFF" : "#DC2626"} />
                      Sedang Promo
                    </button>
                  )}
                  {bestsellerProducts.length > 0 && (
                    <button 
                      className={`${styles.rekomTab} ${activeRekomendasiTab === 'terlaris' ? styles.rekomTabActive : ''}`}
                      onClick={() => setActiveRekomendasiTab('terlaris')}
                    >
                      <Star size={16} strokeWidth={2.5} color={activeRekomendasiTab === 'terlaris' ? "#FFF" : "var(--accent)"} fill={activeRekomendasiTab === 'terlaris' ? "#FFF" : "var(--accent)"} />
                      Terlaris
                    </button>
                  )}
                  {newProducts.length > 0 && (
                    <button 
                      className={`${styles.rekomTab} ${activeRekomendasiTab === 'terbaru' ? styles.rekomTabActive : ''}`}
                      onClick={() => setActiveRekomendasiTab('terbaru')}
                    >
                      <Sparkles size={16} strokeWidth={2.5} color={activeRekomendasiTab === 'terbaru' ? "#FFF" : "var(--primary)"} />
                      Terbaru
                    </button>
                  )}
                </div>

                <div className="rekomendasiContent">
                  {activeRekomendasiTab === 'promo' && promoProducts.length > 0 && renderProductGrid(promoProducts, true, true)}
                  {activeRekomendasiTab === 'terlaris' && bestsellerProducts.length > 0 && renderProductGrid(bestsellerProducts, true, true)}
                  {activeRekomendasiTab === 'terbaru' && newProducts.length > 0 && renderProductGrid(newProducts, true, true)}
                </div>
              </div>
            )}
            
            <AboutUs config={storeConfig} />
            <Gallery />
            <Testimonial />
          </>
        )}

        {isToastVisible && <Toast message={toastMessage} onClose={() => setIsToastVisible(false)} />}
      </main>
      
      <Footer config={storeConfig} />
    </>
  );
}
