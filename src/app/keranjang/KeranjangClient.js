"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Keranjang.module.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

export default function KeranjangClient({ storeWaNumber }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    // Load keranjang + profil user sekaligus
    Promise.all([
      fetch("/api/cart").then(res => {
        if (res.status === 401) { router.push("/masuk"); return []; }
        return res.json();
      }),
      fetch("/api/user/profile").then(res => res.ok ? res.json() : null)
    ])
      .then(([cartData, userData]) => {
        setItems(Array.isArray(cartData) ? cartData : []);
        setUser(userData);
      })
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
      }
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
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
        <Link href="/" className={styles.backLink}>← Lanjut Belanja</Link>
        <h1 className={styles.title}>Keranjang Belanja</h1>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2 className={styles.emptyTitle}>Keranjang Masih Kosong</h2>
            <p className={styles.emptyText}>Yuk, tambahkan menu favorit Anda!</p>
            <Link href="/" className={styles.btnBrowse}>Lihat Menu</Link>
          </div>
        ) : (
          <div className={styles.layout}>
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
                        <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', marginBottom: '8px' }}>
                          {item.variants.map((v, i) => (
                            <div key={i}>{v.groupName}: <strong>{v.optionName}</strong></div>
                          ))}
                        </div>
                      )}
                      <div className={styles.itemPriceRow}>
                        <span className={styles.itemPrice}>{formatPrice(price)}</span>
                        {isPromo && <span className={styles.itemOriginal}>{formatPrice(item.product.price)}</span>}
                      </div>
                      <div className={styles.qtyControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          disabled={updating[item.id]}
                        >−</button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          disabled={updating[item.id]}
                        >+</button>
                      </div>
                    </div>
                    <div className={styles.itemRight}>
                      <span className={styles.itemSubtotal}>{formatPrice(price * item.quantity)}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.id)}
                        disabled={updating[item.id]}
                      >🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>Ringkasan Pesanan</h2>
              {user?.name && (
                <div className={styles.userInfo}>
                  <div className={styles.userInfoRow}><span>Nama</span><span>{user.name}</span></div>
                  {user.address && <div className={styles.userInfoRow}><span>Alamat</span><span>{user.address}</span></div>}
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Total ({totalItems} item)</span>
                <span className={styles.summaryTotal}>{formatPrice(totalPrice)}</span>
              </div>
              <button
                className={styles.btnCheckout}
                onClick={handleCheckoutWA}
              >
                📱 Pesan via WhatsApp
              </button>
              {!user?.address && (
                <p className={styles.addressHint}>
                  💡 <Link href="/profil" className={styles.hintLink}>Lengkapi profil</Link> untuk isi alamat otomatis
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
