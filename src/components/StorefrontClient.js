"use client";

import { useState, useEffect } from "react";
import styles from "@/app/page.module.css";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import TrustBadges from "@/components/TrustBadges";
import MenuHariIni from "@/components/MenuHariIni";
import ProductCard from "@/components/ProductCard";
import Testimonial from "@/components/Testimonial";
import Footer from "@/components/Footer";
import FloatingCart from "@/components/FloatingCart";
import ProductModal from "@/components/ProductModal";
import Cart from "@/components/Cart";
import Toast from "@/components/Toast";
import { Flame, Star, Sparkles } from "lucide-react";

export default function StorefrontClient({ initialProducts = [], initialCategories = [], storeConfig }) {
  const [cartItems, setCartItems] = useState({});
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    if (selectedProduct || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedProduct, isCartOpen]);

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  const handleUpdateQuantity = (productId, change, productName) => {
    setCartItems(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = newQty;
      }
      return newCart;
    });

    if (change > 0 && productName) {
      showToast(`${productName} ditambahkan ke keranjang`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBuyNow = (productId) => {
    const product = initialProducts.find(p => p.id === productId);
    if (!product) return;

    let message = "Halo Dapur Arabella, saya mau pesan:\n\n";
    message += `- 1x ${product.name} (@ ${formatPrice(product.price)})\n`;
    message += `\n*Total: ${formatPrice(product.price)}*\n\nMohon info untuk pembayaran dan pengiriman ya. Terima kasih!`;
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = storeConfig?.waNumber || "6281234567890";
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const filteredProducts = initialProducts.filter(product => {
    const matchesCategory = activeCategory === "Semua" || product.categoryId === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isDefaultView = searchQuery === "" && activeCategory === "Semua";

  // Sections (Bisa disesuaikan dengan field di database nanti, misal isPromo)
  const promoProducts = initialProducts.filter(p => p.isPromo);
  // Untuk Bestseller & Baru, sementara kita ambil beberapa produk pertama atau terakhir
  const bestsellerProducts = initialProducts.slice(0, 4);
  const newProducts = initialProducts.slice(-4).reverse();

  const totalCartItems = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const totalCartPrice = Object.entries(cartItems).reduce((total, [id, qty]) => {
    const p = initialProducts.find(prod => prod.id === parseInt(id) || prod.id === id);
    return total + (p ? p.price * qty : 0);
  }, 0);

  const renderProductGrid = (items, isSmall = false) => (
    <div className={isSmall ? styles.smallProductGrid : styles.productGrid}>
      {items.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          cartQuantity={cartItems[product.id] || 0}
          onUpdateQuantity={handleUpdateQuantity}
          onBuyNow={handleBuyNow}
          onViewDetail={setSelectedProduct}
          isSmall={isSmall}
        />
      ))}
    </div>
  );

  return (
    <>
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemCount={totalCartItems}
      />
      
      <main className={styles.main}>
        
        {isDefaultView && (
          <>
            <HeroBanner />
            <TrustBadges />
            <MenuHariIni />
          </>
        )}

        <div id="menu-section" className={`${styles.categoryContainer} hide-scrollbar`}>
          <button 
            className={`${styles.categoryPill} ${activeCategory === "Semua" ? styles.activePill : ""}`}
            onClick={() => setActiveCategory("Semua")}
          >
            <span className={styles.categoryIcon}>🍽️</span>
            Semua Menu
          </button>
          {initialCategories.map(category => (
            <button 
              key={category.id}
              className={`${styles.categoryPill} ${activeCategory === category.id ? styles.activePill : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
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
            {initialProducts.length > 0 && <h2 className={styles.subHeading}>Rekomendasi Pilihan</h2>}
            
            {promoProducts.length > 0 && (
              <section id="promo-section" className={styles.smallSection}>
                <h3 className={styles.smallSectionTitle}>
                  <Flame size={20} strokeWidth={2} color="#DC2626" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Sedang Promo
                </h3>
                {renderProductGrid(promoProducts, true)}
              </section>
            )}
            
            {bestsellerProducts.length > 0 && (
              <section className={styles.smallSection}>
                <h3 className={styles.smallSectionTitle}>
                  <Star size={20} strokeWidth={2} color="var(--accent)" fill="var(--accent)" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Terlaris
                </h3>
                {renderProductGrid(bestsellerProducts, true)}
              </section>
            )}
            
            {newProducts.length > 0 && (
              <section className={styles.smallSection}>
                <h3 className={styles.smallSectionTitle}>
                  <Sparkles size={20} strokeWidth={2} color="var(--primary)" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Produk Terbaru
                </h3>
                {renderProductGrid(newProducts, true)}
              </section>
            )}
            
            <Testimonial />
          </>
        )}

        <FloatingCart 
          itemCount={totalCartItems} 
          totalPrice={totalCartPrice} 
          onClick={() => setIsCartOpen(true)}
        />
        
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          cartQuantity={selectedProduct ? (cartItems[selectedProduct.id] || 0) : 0}
          onUpdateQuantity={handleUpdateQuantity}
          onBuyNow={handleBuyNow}
        />
        
        {isCartOpen && (
          <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
             <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
                <Cart 
                  cartItems={cartItems} 
                  products={initialProducts} 
                  onUpdateQuantity={handleUpdateQuantity}
                  onClearCart={() => setCartItems({})}
                  waNumber={storeConfig?.waNumber}
                  onClose={() => setIsCartOpen(false)} 
                />
             </div>
          </div>
        )}

        <Toast 
          message={toastMessage} 
          isVisible={isToastVisible} 
          onClose={() => setIsToastVisible(false)} 
        />
      </main>
      
      <Footer config={storeConfig} />
    </>
  );
}
