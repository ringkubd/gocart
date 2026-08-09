import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function PATCH(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { orderId } = await params
        const body = await req.json()
        const { status, trackingNumber, courierName, note, isPaid } = body

        if (!orderId) {
            return NextResponse.json({ error: "orderId required" }, { status: 400 })
        }

        const existing = await prisma.order.findUnique({ where: { id: orderId } })
        if (!existing) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const data = {}
        if (status) {
            data.status = status
            if (status === "SHIPPED" && !existing.shippedAt) data.shippedAt = new Date()
            if (status === "DELIVERED" && !existing.deliveredAt) data.deliveredAt = new Date()
            if (status === "CANCELLED" && !existing.cancelledAt) data.cancelledAt = new Date()
        }
        if (trackingNumber !== undefined) data.trackingNumber = trackingNumber
        if (courierName !== undefined) data.courierName = courierName
        if (note !== undefined) data.note = note
        if (isPaid !== undefined) data.isPaid = Boolean(isPaid)

        const order = await prisma.order.update({
            where: { id: orderId },
            data,
            include: {
                user: { select: { id: true, name: true, email: true } },
                store: { select: { id: true, name: true, username: true } },
                address: true,
                orderItems: { include: { product: true } },
            },
        })

        return NextResponse.json({ order })
    } catch (error) {
        console.error("Admin order PATCH error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
