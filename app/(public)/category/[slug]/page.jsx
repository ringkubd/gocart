import { notFound } from "next/navigation"
import Link from "next/link"
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { getLocale, buildAlternates, pick } from "@/lib/locale"
import ProductCard from "@/components/ProductCard"
import JsonLd from "@/components/JsonLd"
import { BreadcrumbSchema } from "@/lib/jsonld"

export const revalidate = 300

const SITE = "https://thedhakashop.com"

const getCategory = cache(async (slug) => {
    try {
        return await prisma.category.findFirst({ where: { slug, storeId: null } })
    } catch {
        return null
    }
})

const getProducts = cache(async (categoryName) => {
    try {
        const raw = await prisma.product.findMany({
            where: { category: categoryName, store: { isActive: true } },
            include: { store: true, brand: true, rating: true, variants: true },
            orderBy: { createdAt: "desc" },
        })
        return raw.map(p => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : [],
            thumbnails: Array.isArray(p.thumbnails) ? p.thumbnails : [],
            options: Array.isArray(p.options) ? p.options : [],
            variants: p.variants || [],
            rating: p.rating || [],
        }))
    } catch {
        return []
    }
})

export async function generateMetadata({ params }) {
    const { slug } = await params
    const category = await getCategory(slug)
    const locale = await getLocale()
    if (!category) return { title: "Category not found", robots: { index: false, follow: false } }

    const displayName = pick(locale, category.nameBn, category.name)
    const title = category.seoTitle || (locale === "bn" ? `${displayName} — কিনুন` : `${displayName} — Buy Online`)
    const description = category.seoDescription || (locale === "bn"
        ? `${displayName} — TheDhakaShop থেকে সেরা দামে কিনুন। সারা বাংলাদেশে দ্রুত ডেলিভারি ও ক্যাশ অন ডেলিভারি।`
        : `Shop ${displayName} online in Bangladesh at TheDhakaShop. Genuine products at the best prices, fast delivery and cash on delivery.`)
    const url = `${SITE}/category/${category.slug}`

    return {
        title,
        description,
        alternates: buildAlternates(`/category/${category.slug}`, locale),
        openGraph: {
            title: `${title} | TheDhakaShop`,
            description,
            url,
            locale: locale === "bn" ? "bn_BD" : "en_US",
        },
    }
}

export default async function CategoryPage({ params }) {
    const { slug } = await params
    const category = await getCategory(slug)
    if (!category) notFound()

    const locale = await getLocale()
    const displayName = pick(locale, category.nameBn, category.name)
    const products = await getProducts(category.name)

    const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: category.name,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 30).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE}/product/${p.id}`,
            name: p.name,
        })),
    }

    return (
        <>
            <JsonLd data={[
                BreadcrumbSchema({ items: [
                    { name: "Home", path: "/" },
                    { name: "Shop", path: "/shop" },
                    { name: displayName, path: `/category/${category.slug}` },
                ] }),
                itemList,
            ]} />
            <div className="min-h-[70vh] mx-6">
                <div className="max-w-7xl mx-auto">
                    <nav aria-label="Breadcrumb" className="text-gray-600 text-sm mt-8 mb-4">
                        <Link href="/" className="hover:underline">Home</Link> / <Link href="/shop" className="hover:underline">Shop</Link> / <span className="text-slate-700">{displayName}</span>
                    </nav>
                    <h1 className="text-2xl text-slate-500 mb-6">{displayName} <span className="text-slate-700 font-medium">Products</span></h1>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-32 mt-6">
                            {products.map((product) => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <div className="text-slate-400 py-20 text-center">No products found in this category.</div>
                    )}
                </div>
            </div>
        </>
    )
}
