export default function robots() {
  const baseUrl = process.env.BASE_URL || 'https://www.arabella.web.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/admin/', '/login'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
