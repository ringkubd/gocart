import { prisma } from "@/lib/prisma"

const BASE = "https://thedhakashop.com"

export async function GET() {
    const urls = [
        { url: `${BASE}/`, lastmod: new Date(), priority: 1.0, changefreq: "daily" },
        { url: `${BASE}/shop`, lastmod: new Date(), priority: 0.9, changefreq: "daily" },
        { url: `${BASE}/support`, lastmod: new Date(), priority: 0.4, changefreq: "monthly" },
    ]

    // Product pages (auto-generated product-wise sitemap)
    try {
        const products = await prisma.product.findMany({
            where: { inStock: true, store: { isActive: true } },
            select: { id: true, updatedAt: true, name: true },
        })
        products.forEach(p => {
            urls.push({
                url: `${BASE}/product/${p.id}`,
                lastmod: p.updatedAt,
                priority: 0.8,
                changefreq: "weekly",
            })
        })
    } catch (error) {
        console.error("sitemap products error:", error)
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${u.lastmod.toISOString()}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>`
    return new Response(body, {
        headers: { "Content-Type": "application/xml" },
    })
}
