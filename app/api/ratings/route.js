import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const productId = searchParams.get("productId")

        const where = { hidden: false }
        if (productId) {
            where.productId = productId
        }
        const ratings = await prisma.rating.findMany({
            where,
            include: { user: true, product: true },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ ratings })
    } catch (error) {
        console.error("Ratings GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { rating, review, productId, orderId } = body

        if (!rating || !productId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const existing = await prisma.rating.findUnique({
            where: { userId_productId_orderId: { userId: user.id, productId, orderId: orderId || "none" } },
        })

        if (existing) {
            const updated = await prisma.rating.update({
                where: { id: existing.id },
                data: { rating: Number(rating), review: review || "" },
            })
            return NextResponse.json({ rating: updated })
        }

        const created = await prisma.rating.create({
            data: {
                rating: Number(rating),
                review: review || "",
                userId: user.id,
                productId,
                orderId: orderId || "none",
            },
            include: { user: true },
        })

        return NextResponse.json({ rating: created }, { status: 201 })
    } catch (error) {
        console.error("Ratings POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
