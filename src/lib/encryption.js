import crypto from "crypto";

// Kunci harus tepat 32 karakter (256 bit). 
// Di produksi, pastikan ENCRYPTION_KEY di-set di file .env
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error("FATAL: ENCRYPTION_KEY must be exactly 32 characters in .env");
  }
  return key;
}

export function encrypt(text) {
  if (!text) return "";
  
  const iv = crypto.randomBytes(12); // IV untuk GCM direkomendasikan 12 bytes
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getEncryptionKey()), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Format penyimpanan: iv:authTag:encryptedText
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData) {
  if (!encryptedData) return "";
  
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) {
      // Fallback for very old unencrypted plain-text passwords
      if (encryptedData.length > 0 && !encryptedData.includes(":")) {
        return encryptedData;
      }
      console.warn("Peringatan: Format dekripsi tidak sesuai. Mencegah kebocoran data.");
      return "[Format Data Tidak Valid]"; 
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    
    try {
      // Mencoba dekripsi dengan kunci baru dari .env
      const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getEncryptionKey()), iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (errPrimary) {
      // Jika gagal, coba gunakan kunci bawaan lama (Legacy Key) untuk data lama
      const LEGACY_KEY = "arabella_dapur_secret_key_123456";
      const decipherLegacy = crypto.createDecipheriv(ALGORITHM, Buffer.from(LEGACY_KEY), iv);
      decipherLegacy.setAuthTag(authTag);
      
      let decryptedLegacy = decipherLegacy.update(encryptedText, "hex", "utf8");
      decryptedLegacy += decipherLegacy.final("utf8");
      return decryptedLegacy;
    }
  } catch (err) {
    console.error("Dekripsi gagal:", err);
    return "[Gagal Mendekripsi Data]";
  }
}
