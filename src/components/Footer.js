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
          {address && (
            <p className={styles.textAddress}>
              <MapPin size={16} className={styles.addressIcon} />
              {address}
            </p>
          )}
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>Tautan Bermanfaat</h4>
          <ul className={styles.linkList}>
            <li><Link href="/tentang-kami">Tentang Kami</Link></li>
            <li><Link href="/cara-pemesanan">Cara Pemesanan</Link></li>
            <li><a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">Hubungi via WA</a></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.subtitle}>Hubungi Kami</h4>
          <ul className={styles.socialList}>
            {waNumber && (
              <li>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <Phone size={18} />
                  <span>+{waNumber}</span>
                </a>
              </li>
            )}
            {instagram && (
              <li>
                <a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  <span>@{instagram.replace(/^@/, "")}</span>
                </a>
              </li>
            )}
            {facebook && (
              <li>
                <a href={facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  <span>Facebook Kami</span>
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

        {paymentList.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Metode Pembayaran</h4>
            <div className={styles.paymentMethods}>
              {paymentList.map((method, i) => {
                const Icon = getPaymentIcon(method);
                return (
                  <div key={i} className={styles.paymentCard} title={method}>
                    {Icon ? <Icon size={32} /> : null}
                    <span className={styles.paymentName}>{method}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className={styles.copyright}>
        &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
      </div>
    </footer>
  );
}
