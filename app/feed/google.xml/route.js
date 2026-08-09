import { prisma } from "@/lib/prisma"

const BASE = "https://thedhakashop.com"

export async function GET() {
    // Google Merchant Center product feed (Google Shopping format)
    let products = []
    try {
        products = await prisma.product.findMany({
            where: { inStock: true, store: { isActive: true } },
            include: { brand: true, rating: true, store: true },
        })
    } catch (error) {
        console.error("GMC feed products error:", error)
    }

    const items = products.map(p => {
        const images = Array.isArray(p.images) ? p.images : []
        const image = images[0] || ""
        const absoluteImage = image.startsWith("http") ? image : `${BASE}${image}`
        const brandName = p.brand?.name || "theDhakaShop"
        const avgRating = p.rating.length
            ? (p.rating.reduce((s, r) => s + r.rating, 0) / p.rating.length).toFixed(1)
            : null

        return `  <item>
    <g:id>${p.id}</g:id>
    <title>${escapeXml(p.name)}</title>
    <description>${escapeXml((p.description || "").slice(0, 5000))}</description>
    <link>${BASE}/product/${p.id}</link>
    <image_link>${absoluteImage}</image_link>
    <availability>${p.inStock ? "in stock" : "out of stock"}</availability>
    <price>${p.price.toFixed(2)} USD</price>
    <google_product_category>Electronics</google_product_category>
    <brand>${escapeXml(brandName)}</brand>
    <condition>new</condition>
    <mpn>${p.id.slice(-12)}</mpn>
    ${avgRating ? `<g:product_rating_average>${avgRating}</g:product_rating_average>\n    <g:product_rating_count>${p.rating.length}</g:product_rating_count>` : ""}
  </item>`
    }).join("\n")

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>theDhakaShop Products</title>
    <link>${BASE}</link>
    <description>theDhakaShop Google Shopping product feed</description>
${items}
  </channel>
</rss>`

    return new Response(body, {
        headers: { "Content-Type": "application/xml" },
    })
}

function escapeXml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
}
