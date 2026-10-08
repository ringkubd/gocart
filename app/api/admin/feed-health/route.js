import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

const FEED_URL = "https://thedhakashop.com/feed/google.xml"

// Computes Google Merchant feed health from our own product data
// (mirrors the checks Google performs on the product feed).
export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const products = await prisma.product.findMany({
            where: { store: { isActive: true } },
            include: { brand: true, variants: true },
        })

        const issues = {
            missing_image: [],
            missing_price: [],
            missing_category: [],
            missing_description: [],
            out_of_stock: [],
            no_brand: [],
        }

        for (const p of products) {
            const images = Array.isArray(p.images) ? p.images : []
            const variantPrices = (p.variants || []).map(v => Number(v.price)).filter(x => x > 0)
            const price = Number(p.price) || 0
            const hasPrice = price > 0 || variantPrices.length > 0
            const anyStock = p.inStock || (p.variants || []).some(v => v.inStock && Number(v.stock) > 0)

            const entry = { id: p.id, name: p.name }
            if (!images.length) issues.missing_image.push(entry)
            if (!hasPrice) issues.missing_price.push(entry)
            if (!p.category) issues.missing_category.push(entry)
            if (!p.description || p.description.trim().length < 10) issues.missing_description.push(entry)
            if (!anyStock) issues.out_of_stock.push(entry)
            if (!p.brand?.name) issues.no_brand.push(entry)
        }

        const blocked = new Set()
        for (const key of ["missing_image", "missing_price", "missing_category"]) {
            issues[key].forEach(i => blocked.add(i.id))
        }

        const summary = {
            total: products.length,
            ready: products.length - blocked.size,
            blocked: blocked.size,
        }
        const counts = Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, v.length]))

        return NextResponse.json({
            feedUrl: FEED_URL,
            summary,
            counts,
            samples: Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, v.slice(0, 8)])),
            merchantUrl: "https://merchants.google.com/mc/products/diagnostics",
        })
    } catch (error) {
        console.error("Feed health error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
