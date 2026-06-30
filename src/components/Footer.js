import Link from "next/link";
import styles from "./Footer.module.css";
import { Phone, Mail, MapPin } from "lucide-react";
import { BCAIcon, MandiriIcon, BIIcon, BRIIcon, GoPayIcon, OVOIcon, DanaIcon, QRISIcon, BankTransferIcon, CashIcon } from "./PaymentIcons";

const PAYMENT_MAP = {
  bca: BCAIcon,
  mandiri: MandiriIcon,
  bni: BIIcon,
  bri: BRIIcon,
  gopay: GoPayIcon,
  ovo: OVOIcon,
  dana: DanaIcon,
  qris: QRISIcon,
  shopeepay: GoPayIcon, // Fallback
  banktransfer: BankTransferIcon,
  transfer: BankTransferIcon,
  cash: CashIcon,
  tunai: CashIcon,
};

function getPaymentIcon(name) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return PAYMENT_MAP[key] || BankTransferIcon; // Fallback ke bank icon jika tidak ada
}

export default function Footer({ config = {} }) {
  const {
    storeName = "Dapur Arabella",
    description = "Menyediakan berbagai produk rumahan premium dengan bahan berkualitas tinggi. Dibuat dengan cinta setiap harinya.",
    waNumber = "",
    instagram = "",
    facebook = "",
    email = "",
    address = "",
    paymentMethods = "",
  } = config;

  const paymentList = paymentMethods
    ? paymentMethods.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <footer id="kontak" className={styles.footer}>
      <div className={styles.container}>
        {/* Kolom 1: Brand Info */}
        <div className={styles.section}>
          <div className={styles.logoWrap}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--primary)"/>
                 <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className={styles.title}>{storeName}</h3>
          </div>
          <p className={styles.text}>{description}</p>
        </div>

        {/* Kolom 2: Navigasi */}
        <div className={styles.section}>
          <h4 className={styles.subtitle}>Tautan Bermanfaat</h4>
          <ul className={styles.linkList}>
            <li><Link href="#tentang-kami">Tentang Kami</Link></li>
            <li><Link href="#menu-section">Produk</Link></li>
            <li><Link href="/cara-pemesanan">Cara Pesan</Link></li>
            <li><Link href="/reseller">Reseller / Kemitraan</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Kontak & Operasional */}
        <div className={styles.section}>
          <h4 className={styles.subtitle}>Hubungi Kami</h4>
          <ul className={styles.socialList}>
            {address && (
              <li>
                <div className={styles.contactItem}>
                  <MapPin size={18} className={styles.contactIcon} />
                  <span>{address}</span>
                </div>
              </li>
            )}
            {hours && (
              <li>
                <div className={styles.contactItem}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.contactIcon}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>{hours}</span>
                </div>
              </li>
            )}
            {waNumber && (
              <li>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <Phone size={18} />
                  <span>+{waNumber}</span>
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className={styles.socialLink}>
                  <Mail size={18} />
                  <span>{email}</span>
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Kolom 4: Sosial Media & Pembayaran */}
        <div className={styles.section}>
          <h4 className={styles.subtitle}>Sosial Media</h4>
          <div className={styles.socialRow}>
            {instagram && (
              <a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
          </div>
          
          {paymentList.length > 0 && (
            <div className={styles.paymentWrap}>
              <h4 className={styles.subtitle} style={{marginTop: '2rem'}}>Metode Pembayaran</h4>
              <div className={styles.paymentMethods}>
                {paymentList.map((method, i) => {
                  const Icon = getPaymentIcon(method);
                  return (
                    <div key={i} className={styles.paymentCard} title={method}>
                      {Icon ? <Icon size={28} /> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.copyright}>
        &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
