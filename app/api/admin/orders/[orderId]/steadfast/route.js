import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { steadfastCreateOrder, steadfastStatusByTrackingCode, buildSteadfastPayload } from "@/lib/couriers/steadfast"

// GET: current consignment status (by saved tracking code / invoice)
export async function GET(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { orderId } = await params
        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        try {
            const data = order.trackingNumber
                ? await steadfastStatusByTrackingCode(order.trackingNumber)
                : null
            return NextResponse.json({ status: data, trackingNumber: order.trackingNumber })
        } catch (e) {
            return NextResponse.json({ status: null, error: e.message }, { status: 200 })
        }
    } catch (error) {
        console.error("Steadfast status error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// POST: create a consignment in Steadfast for this order and save tracking info
export async function POST(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { orderId } = await params
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { address: true, user: { select: { name: true } } },
        })
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        const payload = buildSteadfastPayload(order)
        if (!payload.recipient_phone) {
            return NextResponse.json({ error: "Order has no phone number for courier" }, { status: 400 })
        }

        let result
        try {
            result = await steadfastCreateOrder(payload)
        } catch (e) {
            return NextResponse.json({ error: e.message || "Steadfast error" }, { status: e.statusCode || 400 })
        }

        const consignment = result?.consignment || {}
        const trackingCode = consignment.tracking_code || ""
        const consignmentId = consignment.consignment_id || ""

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                courierName: "Steadfast",
                trackingNumber: trackingCode || order.trackingNumber,
            },
            include: {
                store: true,
                address: true,
                user: { select: { id: true, name: true, email: true } },
                orderItems: { include: { product: true, variant: true } },
                statusLogs: { orderBy: { createdAt: "asc" } },
            },
        })

        await prisma.orderStatusLog.create({
            data: {
                orderId,
                status: order.status,
                description: "Sent to Steadfast courier.",
                courierName: "Steadfast",
                courierNote: `Consignment ID: ${consignmentId}${trackingCode ? ` · Tracking: ${trackingCode}` : ""}`,
            },
        })

        return NextResponse.json({ order: updated, consignment, raw: result })
    } catch (error) {
        console.error("Steadfast create error:", error)
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: error.statusCode || 500 })
    }
}
