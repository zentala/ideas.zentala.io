// Przekierowanie do głównego sitemap
export async function get() {
  return {
    status: 301,
    headers: {
      'Location': '/sitemap-index.xml'
    }
  };
}