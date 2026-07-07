"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Tag, ChevronLeft, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import styles from "./Keranjang.module.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export default function KeranjangClient({ storeWaNumber }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [promoProducts, setPromoProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    // Load keranjang, profil user, dan promo sekaligus
    Promise.all([
      fetch("/api/cart").then(res => {
        if (res.status === 401) { router.push("/masuk"); return []; }
        return res.json();
      }),
      fetch("/api/user/profile").then(res => res.ok ? res.json() : null),
      fetch("/api/products").then(res => res.ok ? res.json() : [])
    ])
      .then(([cartData, userData, productsData]) => {
        setItems(Array.isArray(cartData) ? cartData : []);
        setUser(userData);
        // Filter promo products
        if (Array.isArray(productsData)) {
          const promos = productsData.filter(p => p.isPromo).slice(0, 4); // Ambil 4 promo
          setPromoProducts(promos);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const updateQty = async (itemId, newQty) => {
    if (newQty < 1) {
      return removeItem(itemId);
    }
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const addPromoToCart = async (product) => {
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1, variants: [] }),
      });
      if (res.ok) {
        const newItem = await res.json();
        // Cek apakah item sudah ada di keranjang
        setItems(prev => {
          const existing = prev.find(item => item.productId === product.id && (!item.variants || item.variants.length === 0));
          if (existing) {
            return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...prev, newItem];
        });
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const getItemPrice = (item) => {
    const p = item.product;
    const basePrice = p.isPromo && p.promoPrice ? p.promoPrice : p.price;
    const extraPrice = (item.variants || []).reduce((sum, v) => sum + (v.priceMod || 0), 0);
    return basePrice + extraPrice;
  };

  const totalPrice = items.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutWA = () => {
    let message = `Halo Dapur Arabella! 👋\n\nSaya ingin memesan:\n\n`;
    items.forEach(item => {
      const price = getItemPrice(item);
      const varText = (item.variants || []).length > 0 ? ` (${item.variants.map(v => `${v.groupName}: ${v.optionName}`).join(', ')})` : '';
      message += `• ${item.quantity}x ${item.product.name}${varText} — ${formatPrice(price * item.quantity)}\n`;
    });
    message += `\n*Total: ${formatPrice(totalPrice)}*\n\n`;
    if (user?.name) message += `Nama: ${user.name}\n`;
    if (user?.address) message += `Alamat: ${user.address}\n`;
    if (user?.phone) message += `No. HP: ${user.phone}\n`;
    message += `\nMohon info untuk pembayaran dan pengiriman. Terima kasih! 🙏`;

    const encoded = encodeURIComponent(message);
    const phone = storeWaNumber || "6281234567890";
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}><div className={styles.spinner}></div></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}><ChevronLeft size={16} /> Lanjut Belanja</Link>
        
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Keranjang Belanja</h1>
          <p className={styles.subtitle}>Selesaikan pesananmu sebelum kehabisan!</p>
        </div>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <ShoppingCart size={48} className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Keranjang Masih Kosong</h2>
            <p className={styles.emptyText}>Yuk, isi keranjangmu dengan menu-menu lezat kami!</p>
            <Link href="/" className={styles.btnPrimary}>Lihat Menu Sekarang <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Bagian Kiri: List Item & Godaan */}
            <div className={styles.leftCol}>
              <div className={styles.card}>
                <div className={styles.itemList}>
                  {items.map(item => {
                    const price = getItemPrice(item);
                    const isPromo = item.product.isPromo && item.product.promoPrice;
                    return (
                      <div key={item.id} className={styles.itemCard}>
                        <img src={item.product.image} alt={item.product.name} className={styles.itemImg} />
                        <div className={styles.itemInfo}>
                          <h3 className={styles.itemName}>{item.product.name}</h3>
                          {item.variants && item.variants.length > 0 && (
                            <div className={styles.itemVariants}>
                              {item.variants.map((v, i) => (
                                <span key={i} className={styles.variantBadge}>{v.groupName}: {v.optionName}</span>
                              ))}
                            </div>
                          )}
                          <div className={styles.itemPriceRow}>
                            <span className={styles.itemPrice}>{formatPrice(price)}</span>
                            {isPromo && <span className={styles.itemOriginal}>{formatPrice(item.product.price)}</span>}
                          </div>
                        </div>
                        
                        <div className={styles.itemActions}>
                          <div className={styles.qtyControl}>
                            <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity - 1)} disabled={updating[item.id]}>
                              <Minus size={14} />
                            </button>
                            <span className={styles.qtyValue}>{item.quantity}</span>
                            <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)} disabled={updating[item.id]}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <button className={styles.removeBtn} onClick={() => removeItem(item.id)} disabled={updating[item.id]} title="Hapus Item">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Godaan Promo (Cross-sell) */}
              {promoProducts.length > 0 && (
                <div className={styles.promoSection}>
                  <div className={styles.promoHeader}>
                    <h3 className={styles.promoTitle}>
                      <span className={styles.promoEmoji}>🤤</span> Masih lapar?
                    </h3>
                    <p className={styles.promoSubtitle}>Tambah yang seger-seger & manis ini mumpung lagi <strong>DISKON</strong> lho! 👇</p>
                  </div>
                  
                  <div className={styles.promoGrid}>
                    {promoProducts.map(product => (
                      <div key={product.id} className={styles.promoCard}>
                        <div className={styles.promoImgWrap}>
                          <img src={product.image} alt={product.name} className={styles.promoImg} />
                          <div className={styles.promoBadge}><Tag size={12} /> PROMO</div>
                        </div>
                        <div className={styles.promoCardBody}>
                          <h4 className={styles.promoName}>{product.name}</h4>
                          <div className={styles.promoPriceGroup}>
                            <span className={styles.promoOriginal}>{formatPrice(product.price)}</span>
                            <span className={styles.promoCurrent}>{formatPrice(product.promoPrice || product.price)}</span>
                          </div>
                          <button 
                            className={styles.promoAddBtn}
                            onClick={() => addPromoToCart(product)}
                            disabled={addingToCart[product.id]}
                          >
                            {addingToCart[product.id] ? "Menambahkan..." : "+ Keranjang"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bagian Kanan: Ringkasan & Checkout */}
            <div className={styles.rightCol}>
              <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Ringkasan Belanja</h2>
                
                {user?.name && (
                  <div className={styles.userInfoBox}>
                    <div className={styles.userInfoRow}>
                      <span className={styles.userInfoLabel}>Penerima:</span>
                      <span className={styles.userInfoValue}>{user.name}</span>
                    </div>
                    {user.address && (
                      <div className={styles.userInfoRow}>
                        <span className={styles.userInfoLabel}>Alamat:</span>
                        <span className={styles.userInfoValue}>{user.address}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span>Total Harga ({totalItems} barang)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                
                <div className={styles.summaryTotalRow}>
                  <span>Total Belanja</span>
                  <span className={styles.summaryTotalAmount}>{formatPrice(totalPrice)}</span>
                </div>
                
                <button className={styles.btnCheckoutWa} onClick={handleCheckoutWA}>
                  <span className={styles.waIcon}>📱</span> Beli via WhatsApp
                </button>
                
                {!user?.address && (
                  <p className={styles.addressHint}>
                    💡 <Link href="/profil" className={styles.hintLink}>Lengkapi alamat pengiriman</Link> di profil Anda
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

