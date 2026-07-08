"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Loader2, ArrowUp, ArrowDown, Crop } from "lucide-react";
import styles from "./Banners.module.css";
import { useNotification } from "@/lib/useNotification";
import ImageCropper from "@/components/ImageCropper";

export default function BannersClient() {
  const { notify, NotificationBar } = useNotification();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [preview, setPreview] = useState("");
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploadingCrop, setIsUploadingCrop] = useState(false);

  const [formData, setFormData] = useState({
    image: "",
    badge: "",
    title: "",
    subtitle: "",
    ctaText: "Eksplor Menu Sekarang",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) setBanners(await res.json());
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        image: banner.image,
        badge: banner.badge || "",
        title: banner.title,
        subtitle: banner.subtitle || "",
        ctaText: banner.ctaText || "Eksplor Menu Sekarang",
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      });
      setPreview(banner.image);
    } else {
      setEditingBanner(null);
      setFormData({
        image: "",
        badge: "",
        title: "",
        subtitle: "",
        ctaText: "Eksplor Menu Sekarang",
        sortOrder: banners.length,
        isActive: true,
      });
      setPreview("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setPreview("");
    setIsCropperOpen(false);
  };

  const handleCropComplete = async (file) => {
    setIsUploadingCrop(true);
    const formPayload = new FormData();
    formPayload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formPayload,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengunggah");
      }

      const data = await res.json();
      setFormData({ ...formData, image: data.url });
      setPreview(data.url);
      setIsCropperOpen(false);
      notify("Gambar berhasil dipotong dan diunggah", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsUploadingCrop(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingBanner) {
        const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const result = await res.json();
        setBanners(banners.map((b) => (b.id === result.id ? result : b)));
        closeModal();
      } else {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const result = await res.json();
        setBanners([...banners, result]);
        closeModal();
      }
    } catch (error) {
      notify("Error: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus banner ini?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (error) {
      notify("Error: " + error.message, "error");
    }
  };

  const moveItem = (index, direction) => {
    const newBanners = [...banners];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;

    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    setBanners(newBanners);

    Promise.all(
      newBanners.map((b, i) =>
        fetch(`/api/admin/banners/${b.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i }),
        })
      )
    ).catch(() => fetchBanners());
  };

  return (
    <>
    {NotificationBar}
      <div className={`${styles.pageLayout} ${isModalOpen ? styles.withSidePanel : ''}`}>
        <div className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <h2 className={styles.title}>Manajemen Banner</h2>
            {!isModalOpen && (
              <button className={styles.addBtn} onClick={() => openModal()}>
                <Plus size={20} />
                Tambah Banner
              </button>
            )}
          </div>

          <div className={styles.tableContainer}>
            {isLoading ? (
              <div className={styles.emptyState}>
                <Loader2 size={48} className={`${styles.emptyIcon} ${styles.spin}`} />
                <h3>Memuat Data...</h3>
              </div>
            ) : banners.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                </div>
                <h3>Belum ada banner</h3>
                <p>Tambahkan banner hero untuk tampil di halaman utama.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>Urut</th>
                    <th style={{ width: "120px" }}>Gambar</th>
                    <th>Judul</th>
                    <th>Badge</th>
                    <th>Status</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner, index) => (
                    <tr key={banner.id}>
                      <td>
                        <div className={styles.sortBtns}>
                          <button disabled={index === 0} onClick={() => moveItem(index, -1)} className={styles.sortBtn}>
                            <ArrowUp size={14} />
                          </button>
                          <button disabled={index === banners.length - 1} onClick={() => moveItem(index, 1)} className={styles.sortBtn}>
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <img src={banner.image} alt="" className={styles.thumb} onError={(e) => { e.target.style.display = "none"; }} />
                      </td>
                      <td>
                        <div className={styles.titleCell}>{banner.title}</div>
                      </td>
                      <td>
                        {banner.badge ? (
                          <span className={styles.badgeTag}>{banner.badge}</span>
                        ) : (
                          <span style={{ color: "#94A3B8" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${banner.isActive ? styles.active : styles.inactive}`}>
                          {banner.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button className={`${styles.iconBtn} ${styles.edit}`} title="Edit" onClick={() => openModal(banner)}>
                            <Edit2 size={18} />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.delete}`} title="Hapus" onClick={() => handleDelete(banner.id)}>
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

        {isModalOpen && (
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <h3 className={styles.sidePanelTitle}>{editingBanner ? "Edit Banner" : "Tambah Banner Baru"}</h3>
              <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className={styles.sidePanelBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>URL Gambar *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    required type="text" className={styles.input}
                    value={formData.image}
                    onChange={(e) => { setFormData({ ...formData, image: e.target.value }); setPreview(e.target.value); }}
                    placeholder="/images/banner1.png atau https://..."
                  />
                  <button 
                    type="button" 
                    onClick={() => setIsCropperOpen(true)}
                    disabled={!formData.image}
                    style={{ 
                      padding: "0 1rem", 
                      borderRadius: "8px", 
                      border: "1px solid #CBD5E1", 
                      background: formData.image ? "white" : "#F1F5F9",
                      cursor: formData.image ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontWeight: 500,
                      color: "#334155"
                    }}
                  >
                    <Crop size={16} /> Crop
                  </button>
                </div>
                {preview && (
                  <div className={styles.previewWrap}>
                    <img src={preview} alt="preview" className={styles.previewImg} onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Badge</label>
                <input type="text" className={styles.input} value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} placeholder="Cth: Diskon Spesial 20%" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Judul *</label>
                <input required type="text" className={styles.input} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Cita Rasa Rumahan, Kualitas Premium" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Subtitle</label>
                <textarea className={styles.textarea} value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Deskripsi singkat banner" rows={3} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Teks Tombol CTA</label>
                <input type="text" className={styles.input} value={formData.ctaText} onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} placeholder="Eksplor Menu Sekarang" />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Urutan</label>
                  <input type="number" className={styles.input} value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <select className={styles.input} value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className={styles.formFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Tutup</button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : editingBanner ? "Simpan Perubahan" : "Tambah Banner"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {isCropperOpen && (
        <ImageCropper
          imageSrc={formData.image}
          onCropComplete={handleCropComplete}
          onCancel={() => setIsCropperOpen(false)}
          isUploading={isUploadingCrop}
          aspectRatio={21 / 9}
          outputWidth={1920}
          outputHeight={822}
          title="✂️ Sesuaikan Ukuran Banner"
          subtitle="Geser dan zoom untuk mengatur area banner (Rasio Lebar 21:9)"
        />
      )}
    </div>
    </>
  );
}
