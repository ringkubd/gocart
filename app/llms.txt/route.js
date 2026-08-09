import { prisma } from "@/lib/prisma"

const BASE = "https://thedhakashop.com"

export async function GET() {
    let siteName = "theDhakaShop"
    let tagline = "Shop smarter"
    let description = "theDhakaShop is your one-stop destination for electronics, lifestyle and everyday essentials at unbeatable prices."

    try {
        const settings = await prisma.siteSetting.findMany()
        const map = {}
        settings.forEach(s => { map[s.key] = s.value })
        if (map.siteName) siteName = map.siteName
        if (map.tagline) tagline = map.tagline
        if (map.seoDescription) description = map.seoDescription
    } catch (error) {
        // defaults
    }

    let lines = []
    lines.push(`# ${siteName}`)
    lines.push(``)
    lines.push(`> ${tagline}. ${description}`)
    lines.push(``)
    lines.push(`# Key pages`)
    lines.push(``)
    lines.push(`- [Home](${BASE}/)`)
    lines.push(`- [Shop All Products](${BASE}/shop)`)
    lines.push(`- [Support Center](${BASE}/support)`)

    try {
        const products = await prisma.product.findMany({
            where: { inStock: true, store: { isActive: true } },
            select: { id: true, name: true, price: true, category: true },
            take: 500,
        })
        if (products.length) {
            lines.push(``)
            lines.push(`# Products`)
            lines.push(``)
            products.forEach(p => {
                lines.push(`- [${p.name}](${BASE}/product/${p.id}): ${p.category}, ${p.price} USD`)
            })
        }
    } catch (error) {
        // skip
    }

    try {
        const categories = await prisma.category.findMany({ where: { active: true } })
        if (categories.length) {
            lines.push(``)
            lines.push(`# Categories`)
            lines.push(``)
            categories.forEach(c => {
                lines.push(`- [${c.name}](${BASE}/shop?category=${c.slug})`)
            })
        }
    } catch (error) {
        // skip
    }

    try {
        const stores = await prisma.store.findMany({ where: { isActive: true, status: "approved" } })
        if (stores.length) {
            lines.push(``)
            lines.push(`# Stores`)
            lines.push(``)
            stores.forEach(s => {
                lines.push(`- [${s.name}](${BASE}/shop/${s.username}): ${s.description}`)
            })
        }
    } catch (error) {
        // skip
    }

    return new Response(lines.join("\n") + "\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
}
