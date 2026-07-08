"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, ShieldOff, X, Loader2 } from "lucide-react";
import styles from "./Admins.module.css";
import { useNotification } from "@/lib/useNotification";

export default function AdminsClient() {
  const { notify, NotificationBar } = useNotification();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "admin",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => { if (d.authenticated) setSessionUser(d.user); });
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      if (res.ok) setAdmins(await res.json());
    } catch (err) {
      console.error("Failed to fetch admins", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        username: admin.username,
        password: "",
        name: admin.name,
        role: admin.role,
      });
    } else {
      setEditingAdmin(null);
      setFormData({ username: "", password: "", name: "", role: "admin" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAdmin) {
        const body = { name: formData.name, role: formData.role };
        if (formData.password) body.password = formData.password;

        const res = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error((await res.json()).error);
        const result = await res.json();
        setAdmins(admins.map(a => a.id === result.id ? result : a));
        closeModal();
        notify("Admin berhasil diperbarui!");
      } else {
        const res = await fetch("/api/admin/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error((await res.json()).error);
        const result = await res.json();
        setAdmins([...admins, result]);
        closeModal();
        notify("Admin baru berhasil dibuat!");
      }
    } catch (error) {
      notify("Error: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (admin) => {
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      const result = await res.json();
      setAdmins(admins.map(a => a.id === result.id ? result : a));
    } catch (error) {
      notify("Error: " + error.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setAdmins(admins.filter(a => a.id !== id));
    } catch (error) {
      notify("Error: " + error.message, "error");
    }
  };

  return (
    <>
    {NotificationBar}
    <div className={`${styles.pageLayout} ${isModalOpen ? styles.withSidePanel : ''}`}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          {!isModalOpen && (
            <button className={styles.addBtn} onClick={() => openModal()}>
              <Plus size={20} />
              Tambah Admin
            </button>
          )}
        </div>

        <div className={styles.tableContainer}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <Loader2 size={48} className={`${styles.emptyIcon} ${styles.spin}`} />
              <h3>Memuat Data...</h3>
            </div>
          ) : admins.length === 0 ? (
            <div className={styles.emptyState}>
              <Shield size={48} className={styles.emptyIcon} />
              <h3>Belum ada admin</h3>
              <p>Admin pertama akan otomatis dibuat dari env saat login pertama.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className={styles.adminName}>
                        {admin.name}
                        {admin.role === "superadmin" && (
                          <span className={styles.badgeSuper}>Super</span>
                        )}
                      </div>
                    </td>
                    <td><span className={styles.username}>{admin.username}</span></td>
                    <td>
                      <span className={`${styles.roleBadge} ${admin.role === "superadmin" ? styles.roleSuper : styles.roleAdmin}`}>
                        {admin.role === "superadmin" ? "Superadmin" : "Admin"}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${admin.isActive ? styles.active : styles.inactive}`}>
                        {admin.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={`${styles.iconBtn} ${styles.edit}`} title="Edit" onClick={() => openModal(admin)}>
                          <Edit2 size={18} />
                        </button>
                        <button className={`${styles.iconBtn} ${styles.toggle}`} title={admin.isActive ? "Nonaktifkan" : "Aktifkan"} onClick={() => handleToggleActive(admin)}>
                          {admin.isActive ? <ShieldOff size={18} /> : <Shield size={18} />}
                        </button>
                        {admin.role !== "superadmin" && (
                          <button className={`${styles.iconBtn} ${styles.delete}`} title="Hapus" onClick={() => handleDelete(admin.id)}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.sidePanel}>
          <div className={styles.sidePanelHeader}>
            <h3 className={styles.sidePanelTitle}>{editingAdmin ? "Edit Admin" : "Tambah Admin Baru"}</h3>
            <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className={styles.sidePanelBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nama Lengkap *</label>
              <input required type="text" className={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Cth: Budi Santoso" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Username *</label>
              <input required type="text" className={styles.input} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="Cth: budiadmin" disabled={!!editingAdmin} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{editingAdmin ? "Password Baru (kosongkan jika tidak diubah)" : "Password *"}</label>
              <input type="password" className={styles.input} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingAdmin ? "Biarkan kosong" : "Minimal 6 karakter"} required={!editingAdmin} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Role</label>
              <select className={styles.input} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
              <span className={styles.helpText}>
                {formData.role === "superadmin" ? "Superadmin bisa manage admin lain." : "Admin bisa kelola produk & kategori."}
              </span>
            </div>

            <div className={styles.formFooter}>
              <button type="button" className={styles.cancelBtn} onClick={closeModal}>Tutup</button>
              <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : editingAdmin ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </>
  );
}
