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
        const page = parseInt(searchParams.get("page") || "1")
        const pageSize = parseInt(searchParams.get("pageSize") || "30")

        const where = search
            ? { OR: [{ review: { contains: search } }, { user: { name: { contains: search } } }, { product: { name: { contains: search } } }] }
            : {}

        const total = await prisma.rating.count({ where })
        const ratings = await prisma.rating.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, image: true, email: true } },
                product: { select: { id: true, name: true, images: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        return NextResponse.json({ ratings, total, page, pageSize })
    } catch (error) {
        console.error("Admin reviews GET error:", error)
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
        const { id, hidden } = body
        if (!id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        const rating = await prisma.rating.update({
            where: { id },
            data: { hidden: hidden !== undefined ? Boolean(hidden) : false },
        })

        return NextResponse.json({ rating })
    } catch (error) {
        console.error("Admin reviews PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function DELETE(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        if (!body.id) {
            return NextResponse.json({ error: "id required" }, { status: 400 })
        }

        await prisma.rating.delete({ where: { id: body.id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Admin reviews DELETE error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
