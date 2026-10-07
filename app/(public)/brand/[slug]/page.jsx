import { notFound } from "next/navigation"
import Link from "next/link"
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ProductCard"
import JsonLd from "@/components/JsonLd"
import { BreadcrumbSchema } from "@/lib/jsonld"

export const revalidate = 300

const SITE = "https://thedhakashop.com"

const getBrand = cache(async (slug) => {
    try {
        return await prisma.brand.findFirst({ where: { slug, storeId: null } })
    } catch {
        return null
    }
})

const getProducts = cache(async (brandId) => {
    try {
        const raw = await prisma.product.findMany({
            where: { brandId, store: { isActive: true } },
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
    const brand = await getBrand(slug)
    if (!brand) return { title: "Brand not found", robots: { index: false, follow: false } }

    const title = brand.seoTitle || `${brand.name} Products`
    const description = brand.seoDescription ||
        `Shop ${brand.name} products online in Bangladesh at TheDhakaShop. Fast delivery and cash on delivery available.`
    const url = `${SITE}/brand/${brand.slug}`

    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title: `${title} | TheDhakaShop`, description, url },
    }
}

export default async function BrandPage({ params }) {
    const { slug } = await params
    const brand = await getBrand(slug)
    if (!brand) notFound()

    const products = await getProducts(brand.id)

    const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: brand.name,
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
                    { name: brand.name, path: `/brand/${brand.slug}` },
                ] }),
                itemList,
            ]} />
            <div className="min-h-[70vh] mx-6">
                <div className="max-w-7xl mx-auto">
                    <nav aria-label="Breadcrumb" className="text-gray-600 text-sm mt-8 mb-4">
                        <Link href="/" className="hover:underline">Home</Link> / <Link href="/shop" className="hover:underline">Shop</Link> / <span className="text-slate-700">{brand.name}</span>
                    </nav>
                    <h1 className="text-2xl text-slate-500 mb-6">{brand.name} <span className="text-slate-700 font-medium">Products</span></h1>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-32">
                            {products.map((product) => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <div className="text-slate-400 py-20 text-center">No products found for this brand.</div>
                    )}
                </div>
            </div>
        </>
    )
}
