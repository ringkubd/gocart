import { prisma } from "@/lib/prisma"

const BASE = "https://thedhakashop.com"

export async function GET() {
    const urls = []

    // Category pages
    try {
        const categories = await prisma.category.findMany({ where: { active: true } })
        categories.forEach(c => {
            urls.push({
                url: `${BASE}/shop?category=${c.slug}`,
                lastmod: new Date(),
                priority: 0.7,
                changefreq: "weekly",
            })
        })
    } catch (error) {
        console.error("sitemap categories error:", error)
    }

    // Brand pages
    try {
        const brands = await prisma.brand.findMany({ where: { active: true } })
        brands.forEach(b => {
            urls.push({
                url: `${BASE}/shop?brand=${b.slug}`,
                lastmod: new Date(),
                priority: 0.7,
                changefreq: "weekly",
            })
        })
    } catch (error) {
        console.error("sitemap brands error:", error)
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${u.lastmod.toISOString()}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>`
    return new Response(body, {
        headers: { "Content-Type": "application/xml" },
    })
}
