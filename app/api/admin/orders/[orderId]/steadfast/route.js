import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import {
    steadfastCreateOrder,
    steadfastStatusByTrackingCode,
    steadfastStatusByConsignmentId,
    steadfastStatusByInvoice,
    buildSteadfastPayload,
} from "@/lib/couriers/steadfast"

// GET: consignment status. ?by=tracking|cid|invoice  (default: tracking)
export async function GET(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { orderId } = await params
        const { searchParams } = new URL(req.url)
        const by = searchParams.get("by") || "tracking"

        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        try {
            let status = null
            if (by === "cid" && order.courierConsignmentId) status = await steadfastStatusByConsignmentId(order.courierConsignmentId)
            else if (by === "invoice") status = await steadfastStatusByInvoice(order.orderNumber || order.id.slice(-8))
            else if (order.trackingNumber) status = await steadfastStatusByTrackingCode(order.trackingNumber)
            return NextResponse.json({ status, by, trackingNumber: order.trackingNumber, consignmentId: order.courierConsignmentId })
        } catch (e) {
            return NextResponse.json({ status: null, by, error: e.message }, { status: 200 })
        }
    } catch (error) {
        console.error("Steadfast status error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// POST: create a consignment in Steadfast and save tracking + consignment id
export async function POST(req, { params }) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { orderId } = await params
        let body = {}
        try { body = await req.json() } catch (e) { body = {} }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { address: true, user: { select: { name: true } }, orderItems: { include: { product: true, variant: true } } },
        })
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        const payload = buildSteadfastPayload(order, {
            deliveryType: body.deliveryType,
            alternativePhone: body.alternativePhone,
        })
        if (!payload.recipient_phone) {
            return NextResponse.json({ error: "Order has no phone number for courier" }, { status: 400 })
        }
        if (String(payload.recipient_phone).replace(/\D/g, "").length !== 11) {
            return NextResponse.json({ error: "Recipient phone must be 11 digits for Steadfast" }, { status: 400 })
        }

        let result
        try {
            result = await steadfastCreateOrder(payload)
        } catch (e) {
            return NextResponse.json({ error: e.message || "Steadfast error" }, { status: e.statusCode || 400 })
        }

        const consignment = result?.consignment || {}
        const trackingCode = consignment.tracking_code || ""
        const consignmentId = consignment.consignment_id ? String(consignment.consignment_id) : ""

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: {
                courierName: "Steadfast",
                trackingNumber: trackingCode || order.trackingNumber,
                courierConsignmentId: consignmentId || order.courierConsignmentId,
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
