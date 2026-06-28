"use client";

import { useState, useEffect } from "react";
import { PackageSearch, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./Orders.module.css";

const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

const STATUS_LABEL = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  preparing: "Dimasak",
  ready: "Siap Ambil",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_COLOR = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#8B5CF6",
  ready: "#10B981",
  completed: "#6B7280",
  cancelled: "#EF4444",
};

export default function OrdersClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders?limit=100");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus pesanan ini?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) setOrders(orders.filter(o => o.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);

  const parseItems = (items) => {
    if (Array.isArray(items)) return items;
    try { return JSON.parse(items); } catch { return []; }
  };

  if (loading) {
    return (
      <div className={styles.emptyState}>
        <Loader2 size={48} className={`${styles.icon} ${styles.spin}`} />
        <h3>Memuat Pesanan...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Manajemen Pesanan</h2>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <PackageSearch size={48} className={styles.icon} />
          <h3>Belum ada pesanan</h3>
          <p>Pesanan dari pelanggan akan muncul di sini.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <div key={order.id} className={styles.card}>
              <div className={styles.cardHeader} onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                <div className={styles.cardInfo}>
                  <span className={styles.customerName}>{order.customerName}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.totalPrice}>{formatPrice(order.totalPrice)}</span>
                  <span className={styles.statusBadge} style={{ backgroundColor: STATUS_COLOR[order.status] || "#6B7280" }}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                  {expandedId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expandedId === order.id && (
                <div className={styles.cardBody}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Alamat</span>
                    <span>{order.address}</span>
                  </div>
                  {order.notes && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Catatan</span>
                      <span>{order.notes}</span>
                    </div>
                  )}
                  <div className={styles.detailRow}>
                    <span className={styles.label}>No. WA</span>
                    <span>{order.customerPhone || "-"}</span>
                  </div>

                  <div className={styles.itemsSection}>
                    <h4>Pesanan</h4>
                    {parseItems(order.items).map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        <span>{item.qty}x {item.name}</span>
                        <span>{formatPrice(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.statusActions}>
                    <label className={styles.label}>Ubah Status:</label>
                    <div className={styles.statusButtons}>
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          className={`${styles.statusBtn} ${order.status === s ? styles.activeStatus : ""}`}
                          style={order.status === s ? { backgroundColor: STATUS_COLOR[s], borderColor: STATUS_COLOR[s], color: "white" } : {}}
                          onClick={() => handleStatusChange(order.id, s)}
                          disabled={updatingId === order.id}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className={styles.deleteBtn} onClick={() => handleDelete(order.id)}>
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
