// Zwraca lokalną wersję sitemap w trybie developerskim
export async function get({ url }) {
  return {
    status: 301,
    headers: {
      'Location': '/sitemap-0.xml'
    }
  };
}