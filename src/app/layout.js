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
    default: "Dapur Arabella - Jajanan Rumahan Halal & Higienis (Bisa COD!)",
    template: "%s | Dapur Arabella",
  },
  description: "Solusi ngemil lezat dan praktis untuk keluarga tercinta. Dibuat fresh setiap hari tanpa bahan pengawet. Pesan sekarang, bayar pas makanan sampai.",
  keywords: ["dapur arabella", "cireng salju", "frozen food", "camilan rumahan", "pesan makanan online", "es mambo", "cod", "jajanan halal"],
  authors: [{ name: "Dapur Arabella" }],
  creator: "Dapur Arabella",
  openGraph: {
    title: "Dapur Arabella - Jajanan Rumahan Halal & Higienis (Bisa COD!)",
    description: "Solusi ngemil lezat dan praktis untuk keluarga tercinta. Dibuat fresh setiap hari tanpa bahan pengawet. Pesan sekarang, bayar pas makanan sampai.",
    url: "/",
    siteName: "Dapur Arabella",
    images: [
      {
        url: "/images/banner1.png",
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
    title: "Dapur Arabella - Jajanan Rumahan Halal & Higienis (Bisa COD!)",
    description: "Solusi ngemil lezat dan praktis untuk keluarga tercinta. Dibuat fresh setiap hari tanpa bahan pengawet. Pesan sekarang, bayar pas makanan sampai.",
    images: ["/images/banner1.png"],
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
