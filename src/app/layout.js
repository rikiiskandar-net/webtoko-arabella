import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const googleFont = Plus_Jakarta_Sans({
  variable: "--font-google",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(process.env.BASE_URL || "http://localhost:3000"),
  title: {
    default: "Dapur Arabella | Belanja Produk Rumahan Berkualitas",
    template: "%s | Dapur Arabella",
  },
  description: "Katalog online Dapur Arabella. Temukan berbagai macam hidangan rumahan, camilan, dan frozen food lezat, higienis, dan dibuat dengan hati.",
  keywords: ["dapur arabella", "cireng salju", "frozen food", "camilan rumahan", "pesan makanan online", "es mambo"],
  authors: [{ name: "Dapur Arabella" }],
  creator: "Dapur Arabella",
  openGraph: {
    title: "Dapur Arabella | Belanja Produk Rumahan Berkualitas",
    description: "Katalog online Dapur Arabella. Temukan berbagai macam hidangan rumahan, camilan, dan frozen food lezat, higienis, dan dibuat dengan hati.",
    url: "/",
    siteName: "Dapur Arabella",
    images: [
      {
        url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "Dapur Arabella Banner",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dapur Arabella | Belanja Produk Rumahan Berkualitas",
    description: "Katalog online Dapur Arabella. Temukan berbagai macam hidangan rumahan, camilan, dan frozen food lezat, higienis, dan dibuat dengan hati.",
    images: ["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${googleFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
