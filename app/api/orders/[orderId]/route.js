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

        // Store owner, customer, or admin can update
        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        const isStoreOwner = store && store.id === order.storeId
        const isOwner = order.userId && order.userId === user.id
        if (!isStoreOwner && !isOwner && user.role !== "admin") {
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
        if (body.customerNote !== undefined) data.customerNote = body.customerNote

        const updated = await prisma.order.update({
            where: { id: orderId },
            data,
            include: {
                orderItems: { include: { product: true } },
                address: true,
                statusLogs: { orderBy: { createdAt: "asc" } },
                user: { select: { id: true, name: true, email: true, image: true } },
            },
        })

        return NextResponse.json({ order: updated })
    } catch (error) {
        console.error("Order PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
