import { prisma } from "@/lib/prisma"

const BASE = "https://thedhakashop.com"

export async function GET() {
    const urls = []

    try {
        const stores = await prisma.store.findMany({
            where: { isActive: true, status: "approved" },
            select: { username: true, updatedAt: true },
        })
        stores.forEach(s => {
            urls.push({
                url: `${BASE}/shop/${s.username}`,
                lastmod: s.updatedAt,
                priority: 0.6,
                changefreq: "weekly",
            })
        })
    } catch (error) {
        console.error("sitemap stores error:", error)
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${u.lastmod.toISOString()}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join("\n")}
</urlset>`
    return new Response(body, {
        headers: { "Content-Type": "application/xml" },
    })
}
