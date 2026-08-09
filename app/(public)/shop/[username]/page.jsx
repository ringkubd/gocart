import { prisma } from "@/lib/prisma"
import { StoreSchema, BreadcrumbSchema } from "@/lib/jsonld"
import JsonLd from "@/components/JsonLd"
import StoreShopClient from "./StoreShopClient"

export async function generateMetadata({ params }) {
    const { username } = await params

    let title = "Store | theDhakaShop"
    let description = ""
    let ogImage = "/assets/happy_store.webp"
    let store = null

    try {
        store = await prisma.store.findUnique({
            where: { username },
            include: { user: { select: { name: true, image: true } } },
        })
        if (store && store.isActive) {
            title = `${store.name}`
            description = store.description?.slice(0, 155) || title
            ogImage = store.logo || ogImage
        }
    } catch (error) {
        // fallback
    }

    return {
        title,
        description,
        alternates: { canonical: `https://thedhakashop.com/shop/${username}` },
        openGraph: {
            title,
            description,
            images: [{ url: ogImage }],
        },
        robots: store && store.isActive ? { index: true, follow: true } : { index: false, follow: false },
    }
}

export default async function StoreShopPage({ params }) {
    const { username } = await params

    let schemas = []
    try {
        const store = await prisma.store.findUnique({ where: { username } })
        if (store && store.isActive) {
            schemas.push(StoreSchema({ store }))
            schemas.push(BreadcrumbSchema({
                items: [
                    { name: "Home", path: "/" },
                    { name: "Shop", path: "/shop" },
                    { name: store.name, path: `/shop/${store.username}` },
                ],
            }))
        }
    } catch (error) {
        // ignore
    }

    return (
        <>
            {schemas.length > 0 && <JsonLd data={schemas} />}
            <StoreShopClient />
        </>
    )
}
