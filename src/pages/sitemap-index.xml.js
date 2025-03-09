// Ręczna wersja sitemap dla lokalnego developmentu
export async function get() {
  return {
    body: `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://ideas.zentala.io/sitemap-0.xml</loc>
  </sitemap>
</sitemapindex>`,
    headers: {
      'Content-Type': 'application/xml'
    }
  };
}