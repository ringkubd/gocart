import { getSeoByPage } from "@/lib/seo"
import { prisma } from "@/lib/prisma"
import { getLocale, buildAlternates } from "@/lib/locale"
import HomeClient from "./HomeClient"

export const revalidate = 300

export async function generateMetadata() {
    const seo = await getSeoByPage("home")
    const locale = await getLocale()
    return {
        title: { absolute: seo.title },
        description: seo.description,
        keywords: seo.keywords,
        alternates: buildAlternates("/", locale),
        openGraph: {
            title: seo.title,
            description: seo.description,
            locale: locale === "bn" ? "bn_BD" : "en_US",
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
