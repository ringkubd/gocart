import { prisma } from "@/lib/prisma"

export const defaultSeo = {
    title: "theDhakaShop - Shop smarter",
    description: "theDhakaShop is your one-stop destination for electronics, lifestyle and everyday essentials at unbeatable prices.",
    keywords: "dhaka shop, ecommerce, electronics, shopping bangladesh",
    ogImage: "/assets/hero_product_img1.png",
    canonical: "",
    robots: "index, follow",
}

export async function getGlobalSeo() {
    try {
        const settings = await prisma.siteSetting.findMany()
        const map = {}
        settings.forEach(s => { map[s.key] = s.value })

        return {
            title: map.siteName ? `${map.siteName} - ${map.tagline || 'Shop smarter'}` : defaultSeo.title,
            siteName: map.siteName || 'theDhakaShop',
            description: map.seoDescription || defaultSeo.description,
            keywords: map.seoKeywords || defaultSeo.keywords,
            ogImage: map.seoOgImage || defaultSeo.ogImage,
            contact: map.contact || {},
        }
    } catch (error) {
        return defaultSeo
    }
}

export async function getSeoByPage(page) {
    try {
        const seo = await prisma.seoPage.findUnique({ where: { page } })
        if (seo) {
            return {
                title: seo.title,
                description: seo.description,
                keywords: seo.keywords,
                ogImage: seo.ogImage,
                canonical: seo.canonical,
                robots: seo.robots,
            }
        }
    } catch (error) {
        // fall through to global
    }

    const global = await getGlobalSeo()
    return {
        title: global.title,
        description: global.description,
        keywords: global.keywords,
        ogImage: global.ogImage,
        canonical: "",
        robots: "index, follow",
    }
}
