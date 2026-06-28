export default function sitemap() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add more URLs here if your app gets multiple pages (e.g. /products, /about)
  ];
}
