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
        const status = searchParams.get("status") || "pending"

        const stores = await prisma.store.findMany({
            where: { status },
            include: {
                user: { select: { name: true, image: true } },
                _count: { select: { Product: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ stores })
    } catch (error) {
        console.error("Admin stores GET error:", error)
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
        const { storeId, status, isActive } = body

        if (!storeId) {
            return NextResponse.json({ error: "storeId required" }, { status: 400 })
        }

        const data = {}
        if (status) data.status = status
        if (isActive !== undefined) data.isActive = Boolean(isActive)

        const store = await prisma.store.update({
            where: { id: storeId },
            data,
        })

        return NextResponse.json({ store })
    } catch (error) {
        console.error("Admin stores PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
