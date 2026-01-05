// Przekierowanie do odpowiedniej wersji sitemap
export async function get({ url }) {
  // Sprawdź czy jesteśmy w trybie deweloperskim
  const isDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  
  // W trybie deweloperskim przekieruj do dev-sitemap-0.xml
  const sitemapFile = isDev ? '/dev-sitemap-0.xml' : '/sitemap-0.xml';
  
  return {
    status: 301,
    headers: {
      'Location': sitemapFile
    }
  };
}