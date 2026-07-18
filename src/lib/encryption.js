import crypto from "crypto";

// Kunci harus tepat 32 karakter (256 bit). 
// Di produksi, pastikan ENCRYPTION_KEY di-set di file .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "arabella_dapur_secret_key_123456"; // 32 chars
const ALGORITHM = "aes-256-gcm";

export function encrypt(text) {
  if (!text) return "";
  
  const iv = crypto.randomBytes(12); // IV untuk GCM direkomendasikan 12 bytes
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
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
    if (parts.length !== 3) return encryptedData; // Berarti tidak dienkripsi atau format salah (fallback)
    
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    console.error("Dekripsi gagal:", err);
    return "Error: Cannot decrypt";
  }
}
