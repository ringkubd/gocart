import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET(req, { params }) {
    try {
        const { orderId } = await params
        const logs = await prisma.orderStatusLog.findMany({
            where: { orderId },
            orderBy: { createdAt: "asc" },
        })
        return NextResponse.json({ logs })
    } catch (error) {
        console.error("Status logs GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { orderId } = await params
        const body = await req.json()
        const { status, description, courierName, courierNote } = body

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 })
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Update order status + timestamps
        const updateData = { status }
        if (status === "SHIPPED" && !order.shippedAt) updateData.shippedAt = new Date()
        if (status === "DELIVERED" && !order.deliveredAt) updateData.deliveredAt = new Date()
        if (status === "CANCELLED" && !order.cancelledAt) updateData.cancelledAt = new Date()

        await prisma.order.update({ where: { id: orderId }, data: updateData })

        // Create status log entry
        const statusLog = await prisma.orderStatusLog.create({
            data: {
                orderId,
                status,
                description: description || "",
                courierName: courierName || "",
                courierNote: courierNote || "",
            },
        })

        return NextResponse.json({ statusLog }, { status: 201 })
    } catch (error) {
        console.error("Status log POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
