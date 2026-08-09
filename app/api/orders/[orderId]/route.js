import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function PATCH(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { orderId } = await params
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Store owner or admin can update status
        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        const isOwner = store && store.id === order.storeId
        if (!isOwner && user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const data = {}
        if (body.status) {
            data.status = body.status
            if (body.status === "SHIPPED" && !order.shippedAt) data.shippedAt = new Date()
            if (body.status === "DELIVERED" && !order.deliveredAt) data.deliveredAt = new Date()
            if (body.status === "CANCELLED" && !order.cancelledAt) data.cancelledAt = new Date()
        }
        if (body.courierName !== undefined) data.courierName = body.courierName
        if (body.trackingNumber !== undefined) data.trackingNumber = body.trackingNumber
        if (body.note !== undefined) data.note = body.note

        const updated = await prisma.order.update({
            where: { id: orderId },
            data,
            include: {
                orderItems: { include: { product: true } },
                address: true,
                user: { select: { id: true, name: true, email: true, image: true } },
            },
        })

        return NextResponse.json({ order: updated })
    } catch (error) {
        console.error("Order PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
