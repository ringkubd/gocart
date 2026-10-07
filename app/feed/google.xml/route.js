import { prisma } from "@/lib/prisma"

const BASE = "https://thedhakashop.com"
const CURRENCY = "BDT"
const COUNTRY = "BD"

export async function GET() {
    // Google Merchant Center product feed (Google Shopping format, BDT / Bangladesh)
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
        const extraImages = images.slice(1, 5)
            .map(i => (i.startsWith("http") ? i : `${BASE}${i}`))
            .map(u => `    <g:additional_image_link>${u}</g:additional_image_link>`)
            .join("\n")
        const brandName = p.brand?.name || "theDhakaShop"
        const avgRating = p.rating.length
            ? (p.rating.reduce((s, r) => s + r.rating, 0) / p.rating.length).toFixed(1)
            : null

        const price = Number(p.price) || 0
        const mrp = Number(p.mrp) || 0
        const hasSale = mrp > price && price > 0
        const shippingCost = Number(p.deliveryCost) || 0
        const freeDelivery = p.freeDelivery || shippingCost <= 0

        return `  <item>
    <g:id>${p.id}</g:id>
    <title>${escapeXml(p.name)}</title>
    <description>${escapeXml((p.description || "").slice(0, 5000))}</description>
    <link>${BASE}/product/${p.id}</link>
    <g:image_link>${absoluteImage}</g:image_link>
${extraImages}
    <g:availability>${p.inStock ? "in stock" : "out of stock"}</g:availability>
    <g:price>${(hasSale ? mrp : price).toFixed(2)} ${CURRENCY}</g:price>
    ${hasSale ? `<g:sale_price>${price.toFixed(2)} ${CURRENCY}</g:sale_price>` : ""}
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(brandName)}</g:brand>
    <g:google_product_category>${escapeXml(p.category || "Electronics")}</g:google_product_category>
    <g:product_type>${escapeXml(p.category || "")}</g:product_type>
    <g:identifier_exists>no</g:identifier_exists>
    <g:mpn>${p.id.slice(-12)}</g:mpn>
    <g:shipping>
      <g:country>${COUNTRY}</g:country>
      <g:service>Standard</g:service>
      <g:price>${freeDelivery ? "0.00" : shippingCost.toFixed(2)} ${CURRENCY}</g:price>
    </g:shipping>
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
