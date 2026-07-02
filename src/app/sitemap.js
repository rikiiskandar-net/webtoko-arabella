import prisma from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.BASE_URL || 'https://www.arabella.web.id';

  // Fetch all active products
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
  ];
}
