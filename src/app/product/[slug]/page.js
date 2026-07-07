import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductClientHeader from "./ProductClientHeader";
import ProductDetailClient from "./ProductDetailClient";
import Footer from "@/components/Footer";
import styles from "./ProductDetail.module.css";
import prisma from "@/lib/prisma";

const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let product = await prisma.product.findUnique({ where: { slug } });
  
  if (!product && isUUID(slug)) {
    product = await prisma.product.findUnique({ where: { id: slug } });
  }

  if (!product) return { title: "Produk Tidak Ditemukan" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arabella.web.id';

  return {
    title: `${product.name} - Dapur Arabella | Pesan Online Jember`,
    description: `${product.description.replace(/<[^>]*>?/gm, '').substring(0, 150)} - Harga Rp ${product.price.toLocaleString('id-ID')}. Rating ${product.rating}/5 dari ${product.sold}+ pembeli. Pesan sekarang, bisa COD!`,
    keywords: `${product.name}, dapur arabella, pesan online jember, jajanan halal`,
    openGraph: {
      title: `${product.name} - Dapur Arabella`,
      description: product.description.replace(/<[^>]*>?/gm, '').substring(0, 150),
      url: `${baseUrl}/product/${product.slug}`,
      siteName: 'Dapur Arabella',
      locale: 'id_ID',
      type: 'website',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - Dapur Arabella`,
      description: product.description.replace(/<[^>]*>?/gm, '').substring(0, 150),
      images: [product.image],
    },
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        }
      }
    }
  });

  // Handle Backward Compatibility (Redirect old UUIDs to Slug)
  if (!product && isUUID(slug)) {
    product = await prisma.product.findUnique({ 
      where: { id: slug },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    });
    if (product && product.slug) {
      redirect(`/product/${product.slug}`);
    }
  }

  if (!product) {
    notFound();
  }

  const category = await prisma.category.findUnique({ where: { id: product.categoryId } });
  const config = await prisma.storeConfig.findFirst();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arabella.web.id';
  const displayPrice = (product.isPromo && product.promoPrice) ? product.promoPrice : product.price;
  
  // Set priceValidUntil to 1 year from now dynamically
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const priceValidUntil = nextYear.toISOString().split('T')[0];

  // Product JSON-LD Schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.image, ...(product.images || [])],
    "description": product.description.replace(/<[^>]*>?/gm, ''),
    "brand": {
      "@type": "Brand",
      "name": "Dapur Arabella"
    },
    "sku": product.id,
    "category": category ? category.name : "Jajanan",
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product/${product.slug}`,
      "priceCurrency": "IDR",
      "price": displayPrice.toString(),
      "priceValidUntil": priceValidUntil,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Dapur Arabella"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "IDR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "ID",
          "addressRegion": "Jawa Timur"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating > 0 ? product.rating.toString() : "4.8",
      "bestRating": "5",
      "worstRating": "1",
      "reviewCount": product.sold === "0" ? "50" : product.sold.replace(/[^0-9]/g, '') || "50"
    }
  };

  // BreadcrumbList JSON-LD Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Beranda",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": category ? category.name : "Produk",
        "item": `${baseUrl}/#menu-section`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `${baseUrl}/product/${product.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductClientHeader />
      <div className={styles.pageWrapper}>
        <main className={styles.main}>
          <Link href="/" className={styles.backLink}><ArrowLeft size={16} /> Kembali ke Menu</Link>
          <ProductDetailClient product={product} config={config} />
        </main>
      </div>
      <Footer config={config} />
    </>
  );
}
