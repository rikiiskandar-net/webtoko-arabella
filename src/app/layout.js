import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const googleFont = Plus_Jakarta_Sans({
  variable: "--font-google",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata() {
  let storeName = "Dapur Arabella";
  let description = "Katalog online Dapur Arabella. Temukan berbagai macam hidangan rumahan, camilan, dan frozen food lezat, higienis, dan dibuat dengan hati.";
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const config = await prisma.storeConfig.findFirst();
    if (config) {
      storeName = config.storeName || storeName;
      description = config.description || description;
    }
  } catch {}

  return {
    metadataBase: new URL(process.env.BASE_URL || "http://localhost:3000"),
    title: {
      default: `${storeName} | Belanja Produk Rumahan Berkualitas`,
      template: `%s | ${storeName}`,
    },
    description,
    keywords: ["dapur arabella", "cireng salju", "frozen food", "camilan rumahan", "pesan makanan online", "es mambo"],
    authors: [{ name: storeName }],
    creator: storeName,
    openGraph: {
      title: `${storeName} | Belanja Produk Rumahan Berkualitas`,
      description,
      url: "/",
      siteName: storeName,
      images: [
        {
          url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&h=630&q=80",
          width: 1200,
          height: 630,
          alt: `${storeName} Banner`,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${storeName} | Belanja Produk Rumahan Berkualitas`,
      description,
      images: ["https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1200&h=630&q=80"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${googleFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
