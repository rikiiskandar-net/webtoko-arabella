import prisma from "@/lib/prisma";
import StorefrontClient from "@/components/StorefrontClient";

export const metadata = {
  title: "Dapur Arabella - Pesan Online",
  description: "Camilan lezat dari Dapur Arabella",
};

// Pastikan halaman ini dinamis (tidak di-cache secara statis oleh Next.js)
// agar setiap penambahan produk di admin langsung muncul.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true } 
  });
  
  const categories = await prisma.category.findMany({ 
    orderBy: { name: 'asc' }
  });

  const storeConfig = await prisma.storeConfig.findFirst();

  return (
    <StorefrontClient 
      initialProducts={products} 
      initialCategories={categories} 
      storeConfig={storeConfig}
    />
  );
}
