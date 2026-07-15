"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, HardHat, Shield, LogOut } from "lucide-react";
import styles from "./Workers.module.css";

const formatRp = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "", // PIN
    name: "",
    role: "Pekerja",
    baseWage: 100000,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch("/api/admin/workers");
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (worker = null) => {
    setError("");
    if (worker) {
      setEditingId(worker.id);
      setFormData({
        username: worker.username,
        password: "", // Leave blank so we don't overwrite if unchanged
        name: worker.name,
        role: worker.role,
        baseWage: worker.baseWage,
        isActive: worker.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        username: "",
        password: "",
        name: "",
        role: "Pekerja",
        baseWage: 100000,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!editingId && !formData.password) {
      setError("PIN Keamanan wajib diisi untuk pekerja baru");
      setSubmitting(false);
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const body = { ...formData };
      if (editingId) body.id = editingId;

      const res = await fetch("/api/admin/workers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");

      setShowModal(false);
      fetchWorkers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus pekerja ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/workers?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchWorkers();
      else alert("Gagal menghapus");
    } catch (err) {
      alert("Error menghapus");
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>👷‍♂️ Manajemen Pekerja Proyek</h2>
        <button className={styles.btnAdd} onClick={() => handleOpenModal()}>
          <Plus size={18} /> Tambah Pekerja
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Loader2 className={styles.spinner} size={30} />
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NAMA</th>
                <th>USERNAME</th>
                <th>PERAN</th>
                <th>GAJI POKOK</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HardHat size={16} color="#3b82f6" />
                      <strong>{w.name}</strong>
                    </div>
                  </td>
                  <td>{w.username}</td>
                  <td>{w.role}</td>
                  <td>{formatRp(w.baseWage)}</td>
                  <td>
                    <span className={w.isActive ? styles.badgeActive : styles.badgeInactive}>
                      {w.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.btnEdit} onClick={() => window.location.href = `/dashboard/workers/${w.id}`} title="Lihat Laporan Gaji"><LogOut size={16} style={{transform: 'rotate(-90deg)'}} /></button>
                      <button className={styles.btnEdit} onClick={() => handleOpenModal(w)} title="Edit"><Pencil size={16} /></button>
                      <button className={styles.btnDelete} onClick={() => handleDelete(w.id, w.name)} title="Hapus"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {workers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Belum ada pekerja terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? "Edit Pekerja" : "Tambah Pekerja Baru"}</h3>
              <button className={styles.btnClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            {error && <div className={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Nama Lengkap</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Username (Singkat)</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required placeholder="misal: budi" />
              </div>
              <div className={styles.formGroup}>
                <label>PIN Keamanan {editingId && <small>(Kosongkan jika tidak ingin ganti)</small>}</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Peran</label>
                  <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Gaji Pokok / Hari (Rp)</label>
                  <input type="number" value={formData.baseWage} onChange={(e) => setFormData({...formData, baseWage: parseInt(e.target.value) || 0})} required />
                </div>
              </div>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                <label htmlFor="isActive">Akun Aktif (Bisa Absen)</label>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className={styles.btnSave} disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Pekerja"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
