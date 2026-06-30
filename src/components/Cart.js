import { useState } from "react";
import styles from "./Cart.module.css";
import { Send, Trash2, Plus, Minus, X } from "lucide-react";

export default function Cart({ cartItems, products, onUpdateQuantity, onClearCart, onClose, waNumber }) {
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", notes: "" });
  const [isSaving, setIsSaving] = useState(false);

  if (Object.keys(cartItems).length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.cartHeaderEmpty}>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>
        <div className={styles.emptyIcon}>🛒</div>
        <h3>Keranjang Kosong</h3>
        <p>Belum ada menu yang dipilih.</p>
      </div>
    );
  }

  const getPrice = (p) => p.isPromo && p.promoPrice ? p.promoPrice : p.price;

  let subtotal = 0;
  let discountableTotal = 0;

  Object.entries(cartItems).forEach(([id, qty]) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const lineTotal = getPrice(product) * qty;
      subtotal += lineTotal;
      if (product.isWebDiscountable !== false) {
        discountableTotal += lineTotal;
      }
    }
  });

  const discountAmount = Math.floor(discountableTotal / 10000) * 1000;
  const totalPrice = subtotal - discountAmount;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      alert("Mohon isi Nama dan Alamat Pengiriman.");
      return;
    }

    if (!waNumber) {
      alert("Nomor WhatsApp belum dikonfigurasi.");
      return;
    }

    setIsSaving(true);

    try {
      const orderItems = Object.entries(cartItems).map(([id, qty]) => {
        const product = products.find(p => p.id === id);
        return product ? { id, name: product.name, qty, price: getPrice(product) } : null;
      }).filter(Boolean);

      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone || "",
          address: formData.address,
          notes: formData.notes,
          items: orderItems,
          totalPrice,
        }),
      });
    } catch {
      // Tetap lanjut WA meski simpan gagal
    }

    let message = `Halo Dapur Arabella, saya ingin memesan:\n\n`;
    message += `👤 *Nama:* ${formData.name}\n`;
    message += `📍 *Alamat:* ${formData.address}\n`;
    if (formData.notes) {
      message += `📝 *Catatan:* ${formData.notes}\n`;
    }
    
    const orderId = `WEB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    message += `🏷️ *Order ID:* ${orderId}\n`;

    message += `\n*Pesanan:*\n`;
    
    Object.entries(cartItems).forEach(([id, qty]) => {
      const product = products.find(p => p.id === id);
      if (product) {
        message += `- ${qty}x ${product.name} (@ ${formatPrice(getPrice(product))})\n`;
      }
    });
    
    if (discountAmount > 0) {
      message += `\nSubtotal: ${formatPrice(subtotal)}`;
      message += `\n🎁 *Diskon Web: -${formatPrice(discountAmount)}*\n`;
    }
    
    message += `\n*Total Belanja: ${formatPrice(totalPrice)}*\n\nMohon info total ongkirnya ya. Terima kasih!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, "_blank");
    
    // Clear cart and close modal after successful redirection
    if (onClearCart) onClearCart();
    if (onClose) onClose();
    
    setIsSaving(false);
  };

  return (
    <div className={styles.cartContainer}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Review Pesanan</h2>
        <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
      </div>
      
      <div className={styles.itemList}>
        {Object.entries(cartItems).map(([id, qty]) => {
          const product = products.find(p => p.id === id);
          if (!product) return null;
          
          return (
            <div key={id} className={styles.cartItem}>
              <img src={product.image} alt={product.name} className={styles.itemImage} onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23E2E8F0"><rect width="80" height="80"/></svg>' }} />
              <div className={styles.itemDetails}>
                <h4 className={styles.itemName}>{product.name}</h4>
                <div className={styles.itemPrice}>{formatPrice(getPrice(product) * qty)}</div>
              </div>
              <div className={styles.qtyControl}>
                <button type="button" className={styles.qtyBtn} onClick={() => onUpdateQuantity(product.id, -1, product.name)}>
                  {qty === 1 ? <Trash2 size={16} color="var(--red)" /> : <Minus size={16} />}
                </button>
                <span className={styles.qtyLabel}>{qty}</span>
                <button type="button" className={styles.qtyBtn} onClick={() => onUpdateQuantity(product.id, 1, product.name)}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {discountAmount > 0 ? (
        <div className={styles.promoAlert}>
          ✅ Yeay! Anda mendapat diskon <strong>{formatPrice(discountAmount)}</strong> khusus pemesanan via Web.
        </div>
      ) : (
        <div className={styles.promoAlertInfo}>
          💡 Info: Dapatkan diskon Rp 1.000 setiap kelipatan belanja Rp 10.000 khusus via Web!
        </div>
      )}

      <div className={styles.totalSection}>
        {discountAmount > 0 && (
          <div className={styles.discountRow}>
            <span className={styles.subText}>Subtotal</span>
            <span className={styles.subText}>{formatPrice(subtotal)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className={styles.discountRow}>
            <span className={styles.discountLabel}>Diskon Spesial Web 🎉</span>
            <span className={styles.discountValue}>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className={styles.finalTotalRow}>
          <span>Total Harga</span>
          <span className={styles.totalAmount}>{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <form className={styles.checkoutForm} onSubmit={handleCheckout}>
        <h3 className={styles.formTitle}>Data Pengiriman</h3>
        <div className={styles.inputGroup}>
          <label>Nama Lengkap</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Budi Santoso" required />
        </div>
        <div className={styles.inputGroup}>
          <label>No. WhatsApp (Opsional)</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="08123456789" />
        </div>
        <div className={styles.inputGroup}>
          <label>Alamat Lengkap</label>
          <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Jl. Sudirman No. 123..." rows="3" required></textarea>
        </div>
        <div className={styles.inputGroup}>
          <label>Catatan Tambahan (Opsional)</label>
          <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Cireng digoreng garing..." />
        </div>
        <button type="submit" className={styles.checkoutBtn} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Pesan via WhatsApp"} <Send size={18} style={{marginLeft: '8px'}} />
        </button>
      </form>
    </div>
  );
}
