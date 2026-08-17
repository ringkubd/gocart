import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { orderId } = await params
        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) return NextResponse.json({ error: "No store found" }, { status: 404 })

        const order = await prisma.order.findFirst({
            where: { id: orderId, storeId: store.id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                address: true,
                orderItems: { include: { product: true } },
                statusLogs: { orderBy: { createdAt: "asc" } },
            },
        })

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
        return NextResponse.json({ order })
    } catch (error) {
        console.error("Store order detail error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function PATCH(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { orderId } = await params
        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) return NextResponse.json({ error: "No store found" }, { status: 404 })

        const order = await prisma.order.findFirst({ where: { id: orderId, storeId: store.id } })
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        const body = await req.json()
        const data = {}

        if (body.courierName !== undefined) data.courierName = body.courierName
        if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber
        if (body.note !== undefined) data.note = body.note

        const updated = await prisma.order.update({
            where: { id: orderId },
            data,
            include: {
                user: { select: { id: true, name: true, email: true } },
                address: true,
                orderItems: { include: { product: true } },
                statusLogs: { orderBy: { createdAt: "asc" } },
            },
        })

        return NextResponse.json({ order: updated })
    } catch (error) {
        console.error("Store order update error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
