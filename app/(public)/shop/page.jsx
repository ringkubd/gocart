import { prisma } from "@/lib/prisma"
import { getLocale, buildAlternates } from "@/lib/locale"
import ShopClient from "./ShopClient"

export const revalidate = 300

const SITE = "https://thedhakashop.com"

async function resolveFilters(searchParams) {
    const category = searchParams.category || ""
    const brand = searchParams.brand || ""
    const search = searchParams.search || ""

    const [categories, brands] = await Promise.all([
        prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
        prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }).catch(() => []),
    ])

    const activeCat = category
        ? categories.find(c => c.slug === category || c.name.toLowerCase() === category.toLowerCase())
        : null
    const activeBrand = brand
        ? brands.find(b => b.slug === brand || b.name.toLowerCase() === brand.toLowerCase())
        : null

    return { category, brand, search, categories, brands, activeCat, activeBrand }
}

export async function generateMetadata({ searchParams }) {
    const sp = await searchParams
    const { category, brand, search, activeCat, activeBrand } = await resolveFilters(sp)
    const locale = await getLocale()

    if (search) {
        return {
            title: `Search: ${search}`,
            description: `Search results for "${search}" at TheDhakaShop.`,
            robots: { index: false, follow: true },
        }
    }

    if (activeCat) {
        const name = locale === "bn" ? (activeCat.nameBn || activeCat.name) : activeCat.name
        const title = activeCat.seoTitle || (locale === "bn" ? `${name} — কিনুন` : `${name} — Buy Online`)
        return {
            title,
            description: activeCat.seoDescription || (locale === "bn"
                ? `${name} — TheDhakaShop থেকে সেরা দামে কিনুন। দ্রুত ডেলিভারি।`
                : `Shop ${name} at the best prices in Bangladesh. Fast delivery, cash on delivery available.`),
            alternates: buildAlternates(`/category/${activeCat.slug}`, locale),
        }
    }

    if (activeBrand) {
        const title = activeBrand.seoTitle || (locale === "bn" ? `${activeBrand.name} পণ্য` : `${activeBrand.name} Products`)
        return {
            title,
            description: activeBrand.seoDescription || (locale === "bn"
                ? `${activeBrand.name} পণ্য — TheDhakaShop এ কিনুন।`
                : `Shop ${activeBrand.name} products online in Bangladesh at TheDhakaShop.`),
            alternates: buildAlternates(`/brand/${activeBrand.slug}`, locale),
        }
    }

    return {
        title: locale === "bn" ? "সব পণ্য" : "Shop All Products",
        description: locale === "bn"
            ? "TheDhakaShop-এ সব পণ্য দেখুন — ইলেকট্রনিকস, লাইফস্টাইল ও দৈনন্দিন প্রয়োজনীয় সামগ্রী সেরা দামে।"
            : "Browse all products on TheDhakaShop — electronics, lifestyle and everyday essentials at unbeatable prices in Bangladesh.",
        alternates: buildAlternates("/shop", locale),
    }
}

export default async function ShopPage({ searchParams }) {
    const sp = await searchParams
    const { category, brand, search, categories, brands, activeCat, activeBrand } = await resolveFilters(sp)

    const where = { store: { isActive: true } }
    if (activeCat) where.category = activeCat.name
    else if (category) where.category = category
    if (activeBrand) where.brand = { OR: [{ slug: activeBrand.slug }, { name: activeBrand.name }] }
    else if (brand) where.brand = { OR: [{ slug: brand }, { name: brand }] }
    if (search) where.name = { contains: search }

    let products = []
    try {
        const raw = await prisma.product.findMany({
            where,
            include: { store: true, brand: true, rating: true, variants: true },
            orderBy: { createdAt: "desc" },
        })
        products = raw.map(p => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : [],
            thumbnails: Array.isArray(p.thumbnails) ? p.thumbnails : [],
            options: Array.isArray(p.options) ? p.options : [],
            variants: p.variants || [],
            rating: p.rating || [],
        }))
    } catch (error) {
        products = []
    }

    return (
        <ShopClient
            products={products}
            categories={categories}
            brands={brands}
            category={category}
            brand={brand}
            search={search}
            activeCat={activeCat}
            activeBrand={activeBrand}
        />
    )
}
