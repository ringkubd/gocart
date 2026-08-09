import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const category = searchParams.get("category") || ""
        const storeId = searchParams.get("storeId") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const pageSize = parseInt(searchParams.get("pageSize") || "20")

        const where = {}
        if (search) {
            where.name = { contains: search }
        }
        if (category) {
            where.category = category
        }
        if (storeId) {
            where.storeId = storeId
        }

        const total = await prisma.product.count({ where })
        const products = await prisma.product.findMany({
            where,
            include: {
                store: { select: { id: true, name: true, username: true } },
                brand: { select: { id: true, name: true } },
                _count: { select: { rating: true, orderItems: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        return NextResponse.json({ products, total, page, pageSize })
    } catch (error) {
        console.error("Admin products GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
