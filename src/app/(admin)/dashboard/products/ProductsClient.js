"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, PackageSearch, X, Loader2, ImagePlus } from "lucide-react";
import styles from "./Products.module.css";
import { useNotification } from "@/lib/useNotification";
import ImageCropper from "@/components/ImageCropper";
import dynamic from 'next/dynamic';
import RichTextEditor from '@/components/RichTextEditor';

export default function ProductsClient() {
  const { notify, NotificationBar } = useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [cropperSrc, setCropperSrc] = useState(null);
  const [cropperTarget, setCropperTarget] = useState("main"); // "main" or "gallery"

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories")
        ]);
        
        if (prodRes.ok) setProducts(await prodRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "/images/placeholder.jpg",
    images: [],
    variants: [],
    isPromo: false,
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
      notify("Anda belum memiliki Kategori. Silakan buat kategori terlebih dahulu!", "error");
      return;
    }
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || "",
        image: product.image || "/images/placeholder.jpg",
        images: product.images || [],
        variants: product.variants || [],
        isPromo: product.isPromo,
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
        images: [],
        variants: [],
        isPromo: false,
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
        body: JSON.stringify({
           ...formData,
           price: Number(formData.price),
           originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
           rating: formData.rating ? Number(formData.rating) : 0
        })
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");
      
      const savedProduct = await res.json();
      
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

  const handleFileSelect = (e, target = "main") => {
    const file = e.target.files[0];
    if (!file) return;
    setCropperTarget(target);

    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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
         throw new Error("Gagal mengunggah gambar");
      }
      const data = await res.json();
      
      if (cropperTarget === "main") {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      }
      
      setCropperSrc(null);
      notify("Gambar berhasil diunggah!");
    } catch (error) {
      notify("Error upload gambar: " + error.message, "error");
    } finally {
      setIsUploading(false);
    }
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
      <div className={`${styles.pageLayout} ${isModalOpen ? styles.withSidePanel : ''}`}>
        <div className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <h2 className={styles.title}>Manajemen Produk</h2>
            {!isModalOpen && (
              <button className={styles.addBtn} onClick={() => openModal()}>
                <Plus size={20} />
                Tambah Produk
              </button>
            )}
          </div>

          <div className={styles.tableContainer}>
            {isLoading ? (
              <div className={styles.emptyState}>
                <Loader2 size={48} className={`${styles.emptyIcon} ${styles.spin}`} />
                <h3>Memuat Data...</h3>
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <PackageSearch size={48} className={styles.emptyIcon} />
                <h3>Belum ada produk</h3>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nama Produk</th>
                    <th>Promo</th>
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
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                            <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={product.isPromo} onChange={async (e) => {
                              const newStatus = e.target.checked;
                              // Optimistic update
                              setProducts(products.map(p => p.id === product.id ? { ...p, isPromo: newStatus } : p));
                              try {
                                const res = await fetch(`/api/products/${product.id}/promo`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isPromo: newStatus })
                                });
                                if (!res.ok) throw new Error("Gagal");
                                notify(`Promo ${newStatus ? 'diaktifkan' : 'dimatikan'} untuk ${product.name}`);
                              } catch (err) {
                                // Revert on failure
                                setProducts(products.map(p => p.id === product.id ? { ...p, isPromo: !newStatus } : p));
                                notify("Gagal merubah status promo", "error");
                              }
                            }} />
                            <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: product.isPromo ? '#10B981' : '#CBD5E1', transition: '.4s', borderRadius: '34px' }}>
                              <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: product.isPromo ? '21px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                            </span>
                          </label>
                          {product.isPromo && <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>PROMO</span>}
                        </div>
                      </td>
                      <td>
                        <span className={styles.categoryBadge}>
                          {product.category?.name || "Tanpa Kategori"}
                        </span>
                      </td>
                      <td>
                        {product.originalPrice ? (
                          <div>
                            <span className={styles.strike}>{formatPrice(product.originalPrice)}</span>
                            <br />
                            <span className={styles.price}>{formatPrice(product.price)}</span>
                          </div>
                        ) : (
                          <span className={styles.price}>{formatPrice(product.price)}</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <button type="button" className={`${styles.iconBtn} ${styles.edit}`} onClick={() => openModal(product)}>
                            <Edit2 size={18} />
                          </button>
                          <button type="button" className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDelete(product.id)}>
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
              <h3 className={styles.sidePanelTitle}>{editingProduct ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button type="button" className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.sidePanelBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nama Produk *</label>
                <input required type="text" className={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Cth: Cireng Salju Bumbu Rujak" />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Harga Jual (Rp) *</label>
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

              {/* Photos */}
              <div className={styles.formRow} style={{ alignItems: 'flex-start' }}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Foto Utama *</label>
                  {formData.image && (
                    <img src={formData.image} alt="Preview" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0' }} />
                  )}
                  <div>
                    <label style={{ display: 'inline-flex', padding: '8px 16px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, "main")} disabled={isUploading} />
                      Ganti Foto Utama
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Foto Tambahan Galeri (Opsional)</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={img} alt="Gallery" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                        <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20, border: 'none', cursor: 'pointer', fontSize: '12px' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={{ display: 'inline-flex', padding: '8px 16px', background: '#EFF6FF', border: '1px dashed #3B82F6', color: '#3B82F6', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, "gallery")} disabled={isUploading} />
                      + Tambah Foto Galeri
                    </label>
                  </div>
                </div>
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
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Harga Coret / Lama (Opsional)</label>
                  <input type="number" className={styles.input} value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Label Badge</label>
                  <select className={styles.input} value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})}>
                    <option value="">Tanpa Badge</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Terbaru">Terbaru</option>
                    <option value="Rekomendasi">Rekomendasi</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Rating</label>
                  <input type="number" step="0.1" max="5" className={styles.input} value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Terjual</label>
                  <input type="text" className={styles.input} value={formData.sold} onChange={(e) => setFormData({...formData, sold: e.target.value})} placeholder="Cth: 500+" />
                </div>
              </div>

              {/* Variants */}
              <div className={styles.formGroup}>
                <label className={styles.label} style={{ marginTop: '10px' }}>Varian Produk & Kustomisasi (Opsional)</label>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '12px' }}>Gunakan fitur ini untuk menambah opsi ke pesanan. Misalnya: Ekstra Keju (+Rp3.000) atau Porsi Reguler (+Rp0).</div>
                
                {formData.variants.map((variant, vIdx) => (
                  <div key={vIdx} style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input type="text" className={styles.input} placeholder="Nama Opsi (Cth: Level Pedas)" value={variant.name} onChange={(e) => {
                        const newVars = [...formData.variants];
                        newVars[vIdx].name = e.target.value;
                        setFormData({...formData, variants: newVars});
                      }} style={{ flex: 1, fontWeight: 600 }} />
                      <button type="button" onClick={() => {
                        const newVars = [...formData.variants];
                        newVars.splice(vIdx, 1);
                        setFormData({...formData, variants: newVars});
                      }} style={{ padding: '8px 12px', background: '#FEE2E2', color: '#EF4444', borderRadius: '6px', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>

                    <div style={{ marginLeft: '12px', borderLeft: '2px solid #CBD5E1', paddingLeft: '12px' }}>
                      {variant.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                          <input type="text" className={styles.input} placeholder="Pilihan (Cth: Level 1)" value={opt.name} onChange={(e) => {
                            const newVars = [...formData.variants];
                            newVars[vIdx].options[oIdx].name = e.target.value;
                            setFormData({...formData, variants: newVars});
                          }} style={{ flex: 1, padding: '6px 10px' }} />
                          <span style={{ fontSize: '0.9rem', color: '#64748B' }}>+Rp</span>
                          <input type="number" className={styles.input} placeholder="Harga Tambahan" value={opt.priceMod} onChange={(e) => {
                            const newVars = [...formData.variants];
                            newVars[vIdx].options[oIdx].priceMod = Number(e.target.value);
                            setFormData({...formData, variants: newVars});
                          }} style={{ width: '120px', padding: '6px 10px' }} />
                          <button type="button" onClick={() => {
                            const newVars = [...formData.variants];
                            newVars[vIdx].options.splice(oIdx, 1);
                            setFormData({...formData, variants: newVars});
                          }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const newVars = [...formData.variants];
                        newVars[vIdx].options.push({ name: '', priceMod: 0 });
                        setFormData({...formData, variants: newVars});
                      }} style={{ fontSize: '0.85rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', fontWeight: 500 }}>+ Tambah Pilihan</button>
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={() => {
                  setFormData({...formData, variants: [...formData.variants, { name: '', options: [{ name: '', priceMod: 0 }] }]});
                }} style={{ display: 'block', width: '100%', padding: '10px', background: 'transparent', color: '#3B82F6', border: '2px dashed #93C5FD', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Tambah Grup Varian</button>
              </div>

              {/* Rich Text Description */}
              <div className={styles.formGroup} style={{ marginTop: '20px' }}>
                <label className={styles.label}>Deskripsi Cerita Produk (Rich Text)</label>
                <div style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden' }}>
                  <RichTextEditor value={formData.description} onChange={(val) => setFormData({...formData, description: val})} />
                </div>
              </div>

              <div className={styles.formFooter} style={{ marginTop: '40px' }}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Tutup</button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropperSrc(null)}
          isUploading={isUploading}
        />
      )}
    </>
  );
}
