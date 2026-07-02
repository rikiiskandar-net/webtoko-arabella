"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Trash2, UploadCloud, Loader2 } from "lucide-react";
import styles from "./Media.module.css";
import { useNotification } from "@/lib/useNotification";

export default function MediaClient() {
  const { notify, NotificationBar } = useNotification();
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      } else {
        throw new Error("Gagal mengambil data media");
      }
    } catch (err) {
      console.error(err);
      notify("Gagal memuat galeri media", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Menggunakan endpoint upload yang sudah ada (menyimpan ukuran asli)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengunggah");
      }

      notify("Gambar berhasil diunggah!", "success");
      fetchMedia(); // Refresh galeri
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileName) => {
    if (!confirm("Yakin ingin menghapus gambar ini secara permanen?")) return;

    try {
      const res = await fetch(`/api/admin/media?file=${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus gambar");

      setMedia(media.filter((item) => item.name !== fileName));
      notify("Gambar berhasil dihapus", "success");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    notify("URL berhasil disalin!", "success");
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <>
      {NotificationBar}
      <div>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.title}>Galeri Media</h2>
            <p style={{ color: "#64748B", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Kelola semua aset gambar yang diunggah ke penyimpanan
            </p>
          </div>
          <div className={styles.headerActions}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/jpeg, image/png, image/webp, image/avif"
              className={styles.hiddenInput}
            />
            <button 
              className={styles.uploadBtn} 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <><Loader2 size={20} className={styles.spin} /> Mengunggah...</>
              ) : (
                <><UploadCloud size={20} /> Unggah Gambar Baru</>
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={48} className={`${styles.emptyIcon} ${styles.spin}`} />
            <h3>Memuat Galeri...</h3>
          </div>
        ) : media.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <UploadCloud size={48} />
            </div>
            <h3>Belum ada media</h3>
            <p>Unggah gambar pertama Anda untuk melihatnya di galeri.</p>
          </div>
        ) : (
          <div className={styles.mediaGrid}>
            {media.map((item) => (
              <div key={item.id} className={styles.mediaCard}>
                <div className={styles.imageContainer}>
                  <img src={item.url} alt={item.name} className={styles.image} loading="lazy" />
                  <div className={styles.imageActions}>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => handleCopyUrl(item.url)}
                      title="Salin URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`} 
                      onClick={() => handleDelete(item.name)}
                      title="Hapus Permanen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className={styles.mediaInfo}>
                  <div className={styles.mediaName} title={item.name}>
                    {item.name}
                  </div>
                  <div className={styles.mediaMeta}>
                    <span>{formatSize(item.size)}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
