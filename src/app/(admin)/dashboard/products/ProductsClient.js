"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, PackageSearch, X, Loader2, ImagePlus } from "lucide-react";
import styles from "./Products.module.css";
import { useNotification } from "@/lib/useNotification";
import ImageCropper from "@/components/ImageCropper";

export default function ProductsClient() {
  const { notify, NotificationBar } = useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [cropperSrc, setCropperSrc] = useState(null); // URL gambar yang akan di-crop

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories") // Assuming we need this or we can fetch them together
        ]);
        
        if (prodRes.ok) {
          const prods = await prodRes.json();
          setProducts(prods);
        }
        if (catRes.ok) {
           const cats = await catRes.json();
           setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "/images/placeholder.jpg",
    isPromo: false,
    promoPrice: "",
    originalPrice: "",
    badge: "",
    rating: "",
    sold: "",
    categoryId: "",
    isWebDiscountable: true
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const openModal = (product = null) => {
    if (!product && categories.length === 0) {
      notify("Anda belum memiliki Kategori. Silakan buat kategori terlebih dahulu di menu Manajemen Kategori!", "error");
      return;
    }
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || "",
        image: product.image || "/images/placeholder.jpg",
        isPromo: product.isPromo,
        promoPrice: product.promoPrice || "",
        originalPrice: product.originalPrice || "",
        badge: product.badge || "",
        rating: product.rating || "",
        sold: product.sold || "",
        categoryId: product.categoryId || "",
        isWebDiscountable: product.isWebDiscountable !== undefined ? product.isWebDiscountable : true
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        image: "/images/placeholder.jpg",
        isPromo: false,
        promoPrice: "",
        originalPrice: "",
        badge: "",
        rating: "",
        sold: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        isWebDiscountable: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");
      
      const savedProduct = await res.json();
      
      // Update local state without reloading the page
      if (editingProduct) {
        setProducts(products.map(p => p.id === savedProduct.id ? { ...savedProduct, category: categories.find(c => c.id === savedProduct.categoryId) } : p));
      } else {
        setProducts([{ ...savedProduct, category: categories.find(c => c.id === savedProduct.categoryId) }, ...products]);
      }
      
      closeModal();
      notify("Berhasil menyimpan produk!");
    } catch (error) {
      notify("Error: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: User pilih file → buka cropper
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Buat URL preview untuk dibuka di cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result);
    };
    reader.readAsDataURL(file);
    // Reset input agar bisa pilih file yang sama lagi
    e.target.value = "";
  };

  // Step 2: Setelah di-crop, upload hasilnya
  const handleCropComplete = async (croppedFile) => {
    setIsUploading(true);

    const uploadData = new FormData();
    uploadData.append("file", croppedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal mengunggah gambar");
      }
      const data = await res.json();
      setFormData(prev => ({ ...prev, image: data.url }));
      setCropperSrc(null); // Tutup cropper
      notify("Gambar berhasil diunggah!");
    } catch (error) {
      notify("Error upload gambar: " + error.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropperSrc(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Gagal menghapus data");
        
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        notify("Error: " + error.message, "error");
      }
    }
  };

  return (
    <>
    {NotificationBar}
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>Manajemen Produk</h2>
        <button className={styles.addBtn} onClick={() => openModal()}>
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={48} className={`${styles.emptyIcon} ${styles.spin}`} />
            <h3>Memuat Data...</h3>
            <p>Sedang menyinkronkan dengan database Supabase.</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <PackageSearch size={48} className={styles.emptyIcon} />
            <h3>Belum ada produk</h3>
            <p>Klik tombol &quot;Tambah Produk&quot; untuk mulai mengisi etalase.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                  </td>
                  <td>
                    <div className={styles.productName}>{product.name}</div>
                    {product.isPromo && <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>PROMO</span>}
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>
                      {product.category?.name || "Tanpa Kategori"}
                    </span>
                  </td>
                  <td>
                    {product.isPromo ? (
                      <div>
                        <span className={styles.strike}>{formatPrice(product.price)}</span>
                        <br />
                        <span className={styles.price}>{formatPrice(product.promoPrice)}</span>
                      </div>
                    ) : (
                      <span className={styles.price}>{formatPrice(product.price)}</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <button className={`${styles.iconBtn} ${styles.edit}`} title="Edit" onClick={() => openModal(product)}>
                        <Edit2 size={18} />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.delete}`} title="Hapus" onClick={() => handleDelete(product.id)}>
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.formBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Produk *</label>
                <input required type="text" className={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Cth: Cireng Salju Bumbu Rujak" />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Harga Asli (Rp) *</label>
                  <input required type="number" className={styles.input} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Cth: 20000" />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Kategori *</label>
                  <select required className={styles.input} value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Foto Produk</label>
                
                {formData.image && formData.image !== "/images/placeholder.jpg" && (
                  <div style={{ marginBottom: '10px', position: 'relative', display: 'inline-block' }}>
                    <img src={formData.image} alt="Preview" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                    <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#22C55E', color: 'white', fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>4:3</span>
                  </div>
                )}
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                  <ImagePlus size={20} style={{ color: '#3B82F6' }} />
                  {formData.image !== "/images/placeholder.jpg" ? "Ganti Gambar" : "Pilih Gambar Produk"}
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/avif" 
                    style={{ display: 'none' }}
                    onChange={handleFileSelect} 
                    disabled={isUploading}
                  />
                </label>
                
                <span className={styles.helpText}>Gambar akan otomatis di-crop (4:3) dan dikompres ke WebP sebelum diunggah.</span>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={formData.isPromo} onChange={(e) => setFormData({...formData, isPromo: e.target.checked})} />
                    Aktifkan Promo Reguler
                  </label>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel} style={{ color: '#10B981' }}>
                    <input type="checkbox" checked={formData.isWebDiscountable} onChange={(e) => setFormData({...formData, isWebDiscountable: e.target.checked})} />
                    Aktifkan Diskon Web Spesial
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '4px' }}>Berhak dapat diskon Rp1.000 per kelipatan Rp10.000</span>
                </div>
              </div>

              {formData.isPromo && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Harga Promo (Rp) *</label>
                  <input required={formData.isPromo} type="number" className={styles.input} value={formData.promoPrice} onChange={(e) => setFormData({...formData, promoPrice: e.target.value})} placeholder="Cth: 15000" />
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Harga Asli (coret)</label>
                  <input type="number" className={styles.input} value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} placeholder="Cth: 45000" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Label Badge</label>
                  <select className={styles.input} value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})}>
                    <option value="">Tidak ada</option>
                    <option value="Promo">Promo</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Baru">Baru</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Rating</label>
                  <input type="number" step="0.1" min="0" max="5" className={styles.input} value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} placeholder="Cth: 4.8" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Terjual</label>
                  <input type="text" className={styles.input} value={formData.sold} onChange={(e) => setFormData({...formData, sold: e.target.value})} placeholder="Cth: 1.2k" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Deskripsi</label>
                <textarea className={styles.textarea} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Ceritakan kelezatan produk ini..."></textarea>
              </div>

              <div className={styles.formFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Batal</button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isUploading={isUploading}
        />
      )}
    </div>
    </>
  );
}
