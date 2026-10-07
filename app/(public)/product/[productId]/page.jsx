import { cache } from "react"
import { getSeoByPage } from "@/lib/seo"
import { prisma } from "@/lib/prisma"
import { ProductSchema, BreadcrumbSchema } from "@/lib/jsonld"
import JsonLd from "@/components/JsonLd"
import ProductClient from "./ProductClient"

export const revalidate = 300

// Deduped server-side product fetch (used by metadata + page + schema)
const getProduct = cache(async (productId) => {
    try {
        const p = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                brand: true,
                store: true,
                variants: true,
                rating: { include: { user: true } },
            },
        })
        if (!p) return null
        return {
            ...p,
            images: Array.isArray(p.images) ? p.images : [],
            thumbnails: Array.isArray(p.thumbnails) ? p.thumbnails : [],
            options: Array.isArray(p.options) ? p.options : [],
            variants: p.variants || [],
            rating: p.rating || [],
        }
    } catch (error) {
        return null
    }
})

export async function generateMetadata({ params }) {
    const { productId } = await params
    const seo = await getSeoByPage("product")
    const product = await getProduct(productId)

    if (!product) {
        return {
            title: "Product not found",
            robots: { index: false, follow: false },
        }
    }

    const title = product.seoTitle || product.name
    const description = product.seoDescription || (product.description || "").slice(0, 155) || seo.description
    const ogImage = product.thumbnails?.[0] || product.images?.[0] || seo.ogImage
    const url = `https://thedhakashop.com/product/${productId}`
    const ogTitle = product.nameBn ? `${product.name} (${product.nameBn})` : title

    return {
        title,
        description,
        keywords: product.seoKeywords || [product.category, product.brand?.name, product.name].filter(Boolean).join(", ") || seo.keywords,
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            title: ogTitle,
            description,
            url,
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description,
            images: ogImage ? [ogImage] : undefined,
        },
        robots: product.inStock || product.variants?.some(v => v.inStock)
            ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
            : { index: true, follow: true },
    }
}

export default async function ProductPage({ params }) {
    const { productId } = await params
    const product = await getProduct(productId)

    let schemas = []
    if (product) {
        schemas.push(ProductSchema({ product }))
        schemas.push(BreadcrumbSchema({
            items: [
                { name: "Home", path: "/" },
                { name: "Shop", path: "/shop" },
                ...(product.category ? [{ name: product.category, path: `/shop?category=${encodeURIComponent(product.category)}` }] : []),
                { name: product.name, path: `/product/${product.id}` },
            ],
        }))
    }

    return (
        <>
            {schemas.length > 0 && <JsonLd data={schemas} />}
            <ProductClient initialProduct={product} />
        </>
    )
}
