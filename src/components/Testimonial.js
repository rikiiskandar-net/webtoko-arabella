import styles from "./Testimonial.module.css";

const testimonials = [
  { id: 1, name: "Budi T.", text: "Cireng saljunya renyah banget! Bumbunya pas, nggak pelit. Bakal langganan terus.", rating: 5 },
  { id: 2, name: "Siti M.", text: "Es mambonya ngingetin zaman SD. Anak-anak di rumah pada suka, buah aslinya kerasa.", rating: 5 },
  { id: 3, name: "Andi K.", text: "Pengiriman cepat, bolu karamelnya masih fresh dan empuk pas sampai. Mantap Dapur Arabella!", rating: 5 }
];

export default function Testimonial() {
  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Apa Kata Pelanggan Kami?</h3>
      <div className={`${styles.scrollContainer} hide-scrollbar`}>
        {testimonials.map(t => (
          <div key={t.id} className={styles.card}>
            <div className={styles.quoteIcon}>&quot;</div>
            <div className={styles.stars}>
              {[...Array(t.rating)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ))}
            </div>
            <p className={styles.text}>{t.text}</p>
            <div className={styles.author}>
              <div className={styles.avatar}>{t.name.charAt(0)}</div>
              <p className={styles.name}>{t.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
