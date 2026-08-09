const BASE = "https://thedhakashop.com"

export async function GET() {
    const today = new Date().toISOString()
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE}/sitemap/pages.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap/products.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap/categories.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${BASE}/sitemap/stores.xml</loc><lastmod>${today}</lastmod></sitemap>
</sitemapindex>`
    return new Response(body, {
        headers: { "Content-Type": "application/xml" },
    })
}
