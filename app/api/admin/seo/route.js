import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { getGlobalSeo } from "@/lib/seo"

const pageLabels = {
    home: "Homepage",
    shop: "Shop",
    product: "Product Detail",
    cart: "Cart",
    login: "Login",
    register: "Register",
    orders: "My Orders",
    create_store: "Become a Seller",
    newsletter: "Newsletter",
    dashboard: "Account Dashboard",
}

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const seoPages = await prisma.seoPage.findMany({ orderBy: { page: "asc" } })
        const global = await getGlobalSeo()

        // Load AI crawler + SEO settings
        const settings = await prisma.siteSetting.findMany()
        const settingsMap = {}
        settings.forEach(s => { settingsMap[s.key] = s.value })

        // Ensure all known pages exist in the list
        const existing = new Set(seoPages.map(p => p.page))
        for (const [key, label] of Object.entries(pageLabels)) {
            if (!existing.has(key)) {
                seoPages.push({
                    id: null,
                    page: key,
                    title: global.title,
                    description: global.description,
                    keywords: global.keywords,
                    ogImage: global.ogImage,
                    canonical: "",
                    robots: "index, follow",
                    _new: true,
                })
            }
        }

        return NextResponse.json({
            seoPages,
            pageLabels,
            global,
            aiCrawlers: settingsMap.aiCrawlers || {},
            seoRobots: settingsMap.seoRobots || "index",
            googleConfig: settingsMap.googleConfig || {},
        })
    } catch (error) {
        console.error("SEO GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { page, title, description, keywords, ogImage, canonical, robots } = body

        if (!page) {
            return NextResponse.json({ error: "page required" }, { status: 400 })
        }

        const seo = await prisma.seoPage.upsert({
            where: { page },
            update: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(keywords !== undefined && { keywords }),
                ...(ogImage !== undefined && { ogImage }),
                ...(canonical !== undefined && { canonical }),
                ...(robots !== undefined && { robots }),
            },
            create: {
                page,
                title: title || "theDhakaShop",
                description: description || "",
                keywords: keywords || "",
                ogImage: ogImage || "",
                canonical: canonical || "",
                robots: robots || "index, follow",
            },
        })

        return NextResponse.json({ seo })
    } catch (error) {
        console.error("SEO PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { key, value } = body
        if (!key || value === undefined) {
            return NextResponse.json({ error: "key and value required" }, { status: 400 })
        }

        const setting = await prisma.siteSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        })

        return NextResponse.json({ setting })
    } catch (error) {
        console.error("SEO settings POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
