import { getSeoByPage } from "@/lib/seo"
import { prisma } from "@/lib/prisma"
import HomeClient from "./HomeClient"

export const revalidate = 300

export async function generateMetadata() {
    const seo = await getSeoByPage("home")
    return {
        title: seo.title,
        description: seo.description,
        keywords: seo.keywords,
        alternates: { canonical: "https://thedhakashop.com" },
        openGraph: {
            title: seo.title,
            description: seo.description,
            images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
        },
        robots: {
            index: seo.robots?.includes("index"),
            follow: seo.robots?.includes("follow"),
        },
    }
}

export default async function Home() {
    let products = []
    try {
        const raw = await prisma.product.findMany({
            where: { store: { isActive: true } },
            include: { store: true, brand: true, rating: true, variants: true },
            orderBy: { createdAt: "desc" },
            take: 60,
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

    return <HomeClient initialProducts={products} />
}
