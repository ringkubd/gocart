import { getSeoByPage } from "@/lib/seo"
import { prisma } from "@/lib/prisma"
import { ProductSchema, BreadcrumbSchema } from "@/lib/jsonld"
import JsonLd from "@/components/JsonLd"
import ProductClient from "./ProductClient"

export async function generateMetadata({ params }) {
    const { productId } = await params

    const seo = await getSeoByPage("product")

    let title = seo.title
    let description = seo.description
    let ogImage = seo.ogImage
    let product = null

    try {
        product = await prisma.product.findUnique({
            where: { id: productId },
            include: { brand: true },
        })
        if (product) {
            title = `${product.name}`
            description = product.description?.slice(0, 155) || seo.description
            ogImage = product.images?.[0] || seo.ogImage
        }
    } catch (error) {
        // fall back to default seo
    }

    return {
        title,
        description,
        keywords: seo.keywords,
        alternates: { canonical: `https://thedhakashop.com/product/${productId}` },
        openGraph: {
            title,
            description,
            url: `https://thedhakashop.com/product/${productId}`,
            images: ogImage ? [{ url: ogImage }] : undefined,
        },
        robots: {
            index: seo.robots?.includes("index"),
            follow: seo.robots?.includes("follow"),
        },
    }
}

export default async function ProductPage({ params }) {
    const { productId } = await params

    let schemas = []
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { brand: true, rating: { include: { user: true } } },
        })
        if (product) {
            schemas.push(ProductSchema({ product }))
            schemas.push(BreadcrumbSchema({
                items: [
                    { name: "Home", path: "/" },
                    { name: "Shop", path: "/shop" },
                    { name: product.category || "Products", path: `/shop?category=${encodeURIComponent(product.category || '')}` },
                    { name: product.name, path: `/product/${product.id}` },
                ],
            }))
        }
    } catch (error) {
        // ignore, render without structured data
    }

    return (
        <>
            {schemas.length > 0 && <JsonLd data={schemas} />}
            <ProductClient />
        </>
    )
}
