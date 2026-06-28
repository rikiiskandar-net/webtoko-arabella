import Link from "next/link";
import styles from "./Footer.module.css";
import { BCAIcon, MandiriIcon, BIIcon, GoPayIcon, OVOIcon, DanaIcon, QRISIcon } from "./PaymentIcons";

const PAYMENT_MAP = {
  bca: BCAIcon,
  mandiri: MandiriIcon,
  bni: BIIcon,
  bri: BIIcon,
  gopay: GoPayIcon,
  ovo: OVOIcon,
  dana: DanaIcon,
  qris: QRISIcon,
  shopeepay: GoPayIcon,
};

function getPaymentIcon(name) {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return PAYMENT_MAP[key];
}

export default function Footer({ config = {} }) {
  const {
    storeName = "Dapur Arabella",
    description = "Menyediakan berbagai produk rumahan premium dengan bahan berkualitas tinggi. Dibuat dengan cinta setiap harinya.",
    waNumber = "",
    instagram = "",
    email = "",
    address = "",
    paymentMethods = "",
  } = config;

  const paymentList = paymentMethods
    ? paymentMethods.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <footer className={styles.footer}>
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
          {address && <p className={styles.text} style={{ marginTop: "0.75rem" }}>{address}</p>}
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
          <ul className={styles.linkList}>
            {waNumber && (
              <li>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp: +{waNumber}
                </a>
              </li>
            )}
            {instagram && (
              <li>
                <a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer">
                  Instagram: @{instagram.replace(/^@/, "")}
                </a>
              </li>
            )}
            {email && (
              <li><a href={`mailto:${email}`}>Email: {email}</a></li>
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
                  <span key={i} className={styles.paymentChip}>
                    {Icon ? <Icon size={20} /> : null}
                    {method}
                  </span>
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
