"use client";

import { useState } from "react";
import { Users, ShoppingCart, Check, X } from "lucide-react";
import styles from "./Users.module.css";
import { useNotification } from "@/lib/useNotification";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function UsersClient({ initialUsers = [] }) {
  console.log('UsersClient init', initialUsers);
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState({});
  const { notify, NotificationBar } = useNotification();

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = async (userId, currentStatus) => {
    setToggling(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
        notify(!currentStatus ? "Akun diaktifkan" : "Akun dinonaktifkan", "success");
      } else {
        notify("Gagal mengubah status akun", "error");
      }
    } catch {
      notify("Terjadi kesalahan", "error");
    } finally {
      setToggling(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className={styles.wrapper}>
      <NotificationBar />

      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Manajemen Pengguna</h2>
        <span className={styles.totalBadge}>{users.length} pengguna terdaftar</span>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={40} color="#CBD5E1" />
          <p>{search ? "Tidak ada pengguna yang cocok" : "Belum ada pengguna terdaftar"}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Telepon</th>
                <th className={styles.centerCol}>Keranjang</th>
                <th className={styles.centerCol}>Terdaftar</th>
                <th className={styles.centerCol}>Status</th>
                <th className={styles.centerCol}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                      ) : (
                        <div className={styles.avatarInitials}>{getInitials(user.name)}</div>
                      )}
                      <span className={styles.userName}>{user.name}</span>
                    </div>
                  </td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>{user.phone || <span className={styles.empty}>—</span>}</td>
                  <td className={styles.centerCol}>
                    <div className={styles.cartBadge}>
                      <ShoppingCart size={13} /> {user.cartItemCount}
                    </div>
                  </td>
                  <td className={styles.centerCol}>{formatDate(user.createdAt)}</td>
                  <td className={styles.centerCol}>
                    <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className={styles.centerCol}>
                    <button
                      className={`${styles.toggleBtn} ${user.isActive ? styles.deactivateBtn : styles.activateBtn}`}
                      onClick={() => toggleActive(user.id, user.isActive)}
                      disabled={toggling[user.id]}
                      title={user.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
                    >
                      {toggling[user.id] ? "..." : user.isActive ? <X size={14} /> : <Check size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
