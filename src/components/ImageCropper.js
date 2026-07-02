"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import styles from "./ImageCropper.module.css";

/**
 * Mengambil area crop dari gambar dan menghasilkan Blob WebP yang di-resize.
 */
async function getCroppedImg(imageSrc, pixelCrop, outputWidth = 800, outputHeight = 600) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");

  // Gambar background putih (untuk gambar transparan)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/webp",
      0.85
    );
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

export default function ImageCropper({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  isUploading,
  aspectRatio = 4 / 3,
  outputWidth = 800,
  outputHeight = 600,
  title = "✂️ Potong Gambar Produk",
  subtitle = "Geser dan zoom untuk mengatur area gambar"
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((z) => {
    setZoom(z);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleCropAndUpload = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, outputWidth, outputHeight);
      
      // Buat File object dari Blob untuk dikirim ke API upload
      const file = new File([croppedBlob], `image-${Date.now()}.webp`, {
        type: "image/webp",
      });

      onCropComplete(file);
    } catch (error) {
      console.error("Crop error:", error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        <div className={styles.cropContainer}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
            cropShape="rect"
            showGrid={true}
            style={{
              containerStyle: {
                borderRadius: "12px",
              },
            }}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.zoomControl}>
            <label className={styles.zoomLabel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              Zoom
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        <div className={styles.info}>
          <span className={styles.infoText}>
            📐 Output: {outputWidth}×{outputHeight}px · WebP · Otomatis terkompresi
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isUploading}
          >
            Batal
          </button>
          <button
            type="button"
            className={styles.cropBtn}
            onClick={handleCropAndUpload}
            disabled={isUploading || !croppedAreaPixels}
          >
            {isUploading ? (
              <>
                <span className={styles.spinner}></span>
                Mengunggah...
              </>
            ) : (
              "✂️ Potong & Unggah"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
