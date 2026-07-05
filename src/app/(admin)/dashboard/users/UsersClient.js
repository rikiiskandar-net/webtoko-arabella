"use client";

import { useState } from "react";
import { Users, ShoppingCart, Check, X, Pencil, Trash2, Save } from "lucide-react";
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
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState({});
  const [deleting, setDeleting] = useState({});
  const { notify, NotificationBar } = useNotification();

  // Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "", password: "", isActive: true });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleDelete = async (user) => {
    if (!window.confirm(`PERINGATAN! Menghapus akun "${user.name}" juga akan menghapus keranjang belanjanya secara permanen. Lanjutkan?`)) return;

    setDeleting(prev => ({ ...prev, [user.id]: true }));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        notify("Pengguna berhasil dihapus", "success");
      } else {
        notify("Gagal menghapus pengguna", "error");
      }
    } catch {
      notify("Terjadi kesalahan sistem", "error");
    } finally {
      setDeleting(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      password: "", // biarkan kosong untuk edit
      isActive: user.isActive
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === editingUser ? { ...u, ...updated } : u));
        notify("Data pengguna berhasil diperbarui", "success");
        closeEditModal();
      } else {
        notify("Gagal menyimpan perubahan", "error");
      }
    } catch {
      notify("Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {NotificationBar}

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
                    <div className={styles.actionGroup}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(user)}
                        title="Edit detail pengguna"
                      >
                        <Pencil size={14} />
                      </button>
                      
                      <button
                        className={`${styles.toggleBtn} ${user.isActive ? styles.deactivateBtn : styles.activateBtn}`}
                        onClick={() => toggleActive(user.id, user.isActive)}
                        disabled={toggling[user.id]}
                        title={user.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
                      >
                        {toggling[user.id] ? "..." : user.isActive ? <X size={14} /> : <Check size={14} />}
                      </button>

                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(user)}
                        disabled={deleting[user.id]}
                        title="Hapus permanen"
                      >
                        {deleting[user.id] ? "..." : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Edit User */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Pengguna</h3>
              <button className={styles.closeBtn} onClick={closeEditModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    className={styles.formInput}
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      required
                      className={styles.formInput}
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>No. HP / WhatsApp</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Alamat Pengiriman</label>
                  <textarea
                    rows={3}
                    className={styles.formInput}
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Alamat lengkap..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Password Baru (Opsional)</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    value={editForm.password}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder="Kosongkan jika tidak ingin diubah"
                  />
                  <span className={styles.passwordHelp}>Isi form ini jika admin perlu melakukan reset password akun pelanggan.</span>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Status Akun</label>
                  <select 
                    className={styles.formInput}
                    value={editForm.isActive ? "true" : "false"}
                    onChange={e => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                  >
                    <option value="true">Aktif (Bisa Login)</option>
                    <option value="false">Nonaktif (Diblokir)</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeEditModal}>
                  Batal
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : <><Save size={16} /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
