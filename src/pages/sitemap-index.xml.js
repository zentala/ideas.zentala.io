// Ręczna wersja sitemap dla lokalnego developmentu
export async function get({ url }) {
  // Sprawdź czy jesteśmy w trybie deweloperskim
  const isDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const sitemapFile = isDev ? 'dev-sitemap-0.xml' : 'sitemap-0.xml';
  
  return {
    body: `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${url.origin}/${sitemapFile}</loc>
  </sitemap>
</sitemapindex>`,
    headers: {
      'Content-Type': 'application/xml'
    }
  };
}