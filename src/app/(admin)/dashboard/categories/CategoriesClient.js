"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tags, X, Loader2 } from "lucide-react";
import styles from "./Categories.module.css";
import { ICON_OPTIONS, renderIcon } from "./iconOptions";
import { useNotification } from "@/lib/useNotification";

export default function CategoriesClient() {
  const { notify, NotificationBar } = useNotification();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [selectedIcon, setSelectedIcon] = useState("Grid2x2");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    icon: "Grid2x2",
    description: ""
  });

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon || "Grid2x2",
        description: category.description || ""
      });
      setSelectedIcon(category.icon || "Grid2x2");
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        icon: "Grid2x2",
        description: ""
      });
      setSelectedIcon("Grid2x2");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    setFormData({ ...formData, icon: iconName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan data");
      }
      
      if (editingCategory) {
        setCategories(categories.map(c => c.id === result.id ? result : c));
      } else {
        setCategories([result, ...categories]);
      }
      
      closeModal();
      notify("Berhasil menyimpan kategori!");
    } catch (error) {
      notify("Error: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini? Pastikan tidak ada produk yang menggunakan kategori ini.")) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        const result = await res.json();
        
        if (!res.ok) {
          throw new Error(result.error || "Gagal menghapus data");
        }
        
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        notify("Error: " + error.message, "error");
      }
    }
  };

  return (
    <>
    {NotificationBar}
      <div className={`${styles.pageLayout} ${isModalOpen ? styles.withSidePanel : ''}`}>
        <div className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <h2 className={styles.title}>Manajemen Kategori</h2>
            {!isModalOpen && (
              <button className={styles.addBtn} onClick={() => openModal()}>
                <Plus size={20} />
                Tambah Kategori
              </button>
            )}
          </div>

          <div className={styles.tableContainer}>
            {isLoading ? (
              <div className={styles.emptyState}>
                <Loader2 size={48} className={`${styles.emptyIcon} ${styles.spin}`} />
                <h3>Memuat Data...</h3>
                <p>Sedang menyinkronkan dengan database Supabase.</p>
              </div>
            ) : categories.length === 0 ? (
              <div className={styles.emptyState}>
                <Tags size={48} className={styles.emptyIcon} />
                <h3>Belum ada kategori</h3>
                <p>Klik tombol &quot;Tambah Kategori&quot; untuk mulai membuat pengelompokan produk.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>Icon</th>
                    <th>Nama Kategori</th>
                    <th>Deskripsi</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                        {renderIcon(category.icon, 24) || category.icon}
                      </td>
                      <td>
                        <div className={styles.categoryName}>{category.name}</div>
                      </td>
                      <td>
                        <span className={styles.descriptionText}>
                          {category.description || "-"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button className={`${styles.iconBtn} ${styles.edit}`} title="Edit" onClick={() => openModal(category)}>
                            <Edit2 size={18} />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.delete}`} title="Hapus" onClick={() => handleDelete(category.id)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side Panel Form */}
        {isModalOpen && (
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <h3 className={styles.sidePanelTitle}>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</h3>
              <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.sidePanelBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Kategori *</label>
                <input required type="text" className={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Cth: Minuman Dingin" />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Icon Kategori</label>
                <div className={styles.iconPickerPreview}>
                  {renderIcon(formData.icon, 32)}
                  <span className={styles.selectedIconName}>{formData.icon}</span>
                </div>
                <div className={styles.iconPickerGrid}>
                  {ICON_OPTIONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      className={`${styles.iconPickerItem} ${selectedIcon === iconName ? styles.iconPickerItemActive : ''}`}
                      onClick={() => handleIconSelect(iconName)}
                      title={iconName}
                    >
                      {renderIcon(iconName, 20)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Deskripsi (Opsional)</label>
                <textarea className={styles.textarea} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Deskripsi singkat tentang kategori ini..."></textarea>
              </div>

              <div className={styles.formFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Tutup</button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
