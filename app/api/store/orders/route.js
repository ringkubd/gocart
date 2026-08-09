import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }

        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                user: { select: { name: true, email: true } },
                address: true,
                orderItems: { include: { product: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ orders })
    } catch (error) {
        console.error("Store orders error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
