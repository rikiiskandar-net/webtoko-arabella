import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ThemeProvider, ThemeScript } from "@/components/ThemeProvider";

const googleFont = Plus_Jakarta_Sans({
  variable: "--font-google",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.arabella.web.id"),
  title: {
    default: "Dapur Arabella | Pesan Online Camilan Rumahan Halal Jember - Cireng, Es Mambo, Frozen Food",
    template: "%s | Dapur Arabella",
  },
  description: "Dapur Arabella - Pesan online camilan rumahan halal & higienis di Jember. Cireng ayam suwir, es mambo, basreng chili oil, frozen food. 100% Homemade, tanpa pengawet. Bisa COD & bayar di tempat!",
  keywords: ["dapur arabella", "cireng salju", "cireng ayam suwir", "es mambo", "basreng", "frozen food", "camilan rumahan", "jajanan halal", "pesan makanan online jember", "cireng jember", "es mambo jember", "COD jember", "jajanan murah", "cireng pedas", "sosis chili oil"],
  authors: [{ name: "Dapur Arabella" }],
  creator: "Dapur Arabella",
  publisher: "Dapur Arabella",
  alternates: {
    canonical: '/',
  },
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
        alt: "Dapur Arabella - Camilan Rumahan Halal & Higienis",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dapur Arabella - Jajanan Rumahan Halal & Higienis (Bisa COD!)",
    description: "Solusi ngemil lezat dan praktis untuk keluarga tercinta. Dibuat fresh setiap hari tanpa bahan pengawet.",
    images: ["/images/banner1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'ID-JI',
    'geo.placename': 'Jember',
    'geo.position': '-8.17;113.70',
    'ICBM': '-8.17, 113.70',
  }
};

export default function RootLayout({ children }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.arabella.web.id";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${baseUrl}/#business`,
    "name": "Dapur Arabella",
    "alternateName": "Dapur Arabella Jember",
    "image": `${baseUrl}/images/banner1.png`,
    "logo": `${baseUrl}/images/logo.png`,
    "description": "Dapur Arabella menyajikan aneka jajanan dan camilan rumahan 100% halal, higienis, dan bebas pengawet. Tersedia cireng, es mambo, basreng, frozen food dan masih banyak lagi. Melayani pesan antar dan COD di area Jember.",
    "url": baseUrl,
    "telephone": "+6289654050681",
    "email": "rikiiskandar1945@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Dsn. Panggulmlati RT2 RW7, Des. Kepanjen, Kec. Gumukmas",
      "addressLocality": "Jember",
      "addressRegion": "Jawa Timur",
      "postalCode": "68166",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -8.17,
      "longitude": 113.70
    },
    "servesCuisine": ["Indonesian", "Jajanan Tradisional", "Frozen Food"],
    "priceRange": "Rp1.000 - Rp11.000",
    "currenciesAccepted": "IDR",
    "paymentAccepted": "Cash, Transfer Bank",
    "hasMenu": `${baseUrl}/#menu-section`,
    "menu": `${baseUrl}/#menu-section`,
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "opens": "08:00",
        "closes": "21:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "1200"
    },
    "sameAs": [],
    "potentialAction": {
      "@type": "OrderAction",
      "target": baseUrl
    }
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://stifhngmifzelwpwtabd.supabase.co" />
        <link rel="dns-prefetch" href="https://stifhngmifzelwpwtabd.supabase.co" />
      </head>
      <body className={`${googleFont.variable}`}>
        <ThemeProvider>
          <AnalyticsTracker />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
