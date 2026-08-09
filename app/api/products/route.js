import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const category = searchParams.get("category") || ""
        const brand = searchParams.get("brand") || ""
        const store = searchParams.get("store") || ""
        const featured = searchParams.get("featured")
        const bestSelling = searchParams.get("bestSelling")
        const inStockOnly = searchParams.get("inStock")
        const limit = parseInt(searchParams.get("limit") || "0")

        const where = {
            store: { isActive: true },
        }
        if (search) {
            where.name = { contains: search }
        }
        if (category) {
            where.category = category
        }
        if (brand) {
            where.brand = { slug: brand }
        }
        if (store) {
            where.store = { username: store }
        }
        if (featured === "true") {
            where.featured = true
        }
        if (inStockOnly === "true") {
            where.inStock = true
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                store: true,
                brand: true,
                rating: { include: { user: true } },
            },
            orderBy: bestSelling === "true"
                ? { soldCount: "desc" }
                : { createdAt: "desc" },
            ...(limit ? { take: limit } : {}),
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error("Products GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store || !store.isActive) {
            return NextResponse.json({ error: "You need an approved store to add products" }, { status: 403 })
        }

        const body = await req.json()
        const { name, description, mrp, price, images, category, brandId, stock, featured } = body

        if (!name || !description || !price || !images?.length || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                mrp: Number(mrp) || Number(price),
                price: Number(price),
                images,
                category,
                brandId: brandId || null,
                stock: Number(stock) || 0,
                inStock: stock === undefined || Number(stock) > 0,
                featured: Boolean(featured),
                storeId: store.id,
            },
            include: { store: true, brand: true, rating: true },
        })

        return NextResponse.json({ product }, { status: 201 })
    } catch (error) {
        console.error("Products POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
