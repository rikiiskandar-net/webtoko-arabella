export default function robots() {
  const baseUrl = 'https://www.arabella.web.id';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/admin/', '/login'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
