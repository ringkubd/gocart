const BASE = "https://thedhakashop.com"

export async function GET() {
    const today = new Date().toISOString()
    const urls = [
        { url: `${BASE}/`, priority: 1.0, freq: "daily" },
        { url: `${BASE}/shop`, priority: 0.9, freq: "daily" },
        { url: `${BASE}/support`, priority: 0.4, freq: "monthly" },
        { url: `${BASE}/track-order`, priority: 0.4, freq: "monthly" },
        { url: `${BASE}/return-policy`, priority: 0.3, freq: "monthly" },
    ]
    // Add Bangla (/bn) variants for hreflang discovery
    const bnUrls = urls
        .filter(u => u.url.startsWith(BASE))
        .map(u => ({ ...u, url: u.url.replace(BASE, `${BASE}/bn`) }))
    urls.push(...bnUrls)

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>`
    return new Response(body, {
        headers: { "Content-Type": "application/xml" },
    })
}
