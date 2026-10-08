import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Steadfast -> our callback. Configure in Steadfast dashboard:
//   Callback URL : https://thedhakashop.com/api/webhooks/steadfast
//   Auth Token   : the value of SiteSetting "steadfastWebhookToken"
//
// Payload includes: consignment_id, invoice, status, cod_amount, updated_at, ...

const DELIVERED = ["delivered", "delivered_approval_pending", "partial_delivered", "partial_delivered_approval_pending"]
const CANCELLED = ["cancelled", "cancelled_approval_pending"]
const IN_PROGRESS = ["in_review", "pending", "hold", "unknown", "unknown_approval_pending"]

function mapStatus(steadfastStatus) {
    const st = String(steadfastStatus || "").toLowerCase()
    if (DELIVERED.includes(st)) return "DELIVERED"
    if (CANCELLED.includes(st)) return "CANCELLED"
    if (IN_PROGRESS.includes(st)) return "PROCESSING"
    return null
}

export async function POST(req) {
    try {
        const tokenSetting = await prisma.siteSetting.findUnique({ where: { key: "steadfastWebhookToken" } })
        const expected = tokenSetting?.value && typeof tokenSetting.value === "string" ? tokenSetting.value : (tokenSetting?.value?.token || "")
        const auth = req.headers.get("authorization") || ""
        const provided = auth.startsWith("Bearer ") ? auth.slice(7) : ""

        if (!expected || provided !== expected) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const payload = await req.json().catch(() => null)
        if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

        const required = ["consignment_id", "invoice", "status"]
        const missing = required.filter(k => payload[k] === undefined || payload[k] === null || payload[k] === "")
        if (missing.length) {
            return NextResponse.json({ error: `Missing required properties: ${missing.join(", ")}` }, { status: 400 })
        }

        const invoice = String(payload.invoice)
        const consignmentId = String(payload.consignment_id)

        const order = await prisma.order.findFirst({
            where: { OR: [{ orderNumber: invoice }, { courierConsignmentId: consignmentId }] },
        })
        if (!order) {
            // Accept but note — nothing to update
            return NextResponse.json({ status: "success", note: "order not found" }, { status: 200 })
        }

        const mapped = mapStatus(payload.status)
        const data = { courierName: "Steadfast" }
        if (payload.tracking_code) data.trackingNumber = String(payload.tracking_code)
        if (!order.courierConsignmentId) data.courierConsignmentId = consignmentId

        if (mapped === "DELIVERED") {
            data.status = "DELIVERED"
            if (!order.deliveredAt) data.deliveredAt = payload.updated_at ? new Date(payload.updated_at) : new Date()
        } else if (mapped === "CANCELLED") {
            data.status = "CANCELLED"
            if (!order.cancelledAt) data.cancelledAt = payload.updated_at ? new Date(payload.updated_at) : new Date()
        } else if (mapped === "PROCESSING" && (order.status === "ORDER_PLACED")) {
            data.status = "PROCESSING"
        }

        await prisma.order.update({ where: { id: order.id }, data })

        await prisma.orderStatusLog.create({
            data: {
                orderId: order.id,
                status: data.status || order.status,
                description: payload.tracking_message || `Courier status: ${payload.status}`,
                courierName: "Steadfast",
                courierNote: `consignment ${consignmentId} · ${payload.status}${payload.cod_amount !== undefined ? ` · COD ${payload.cod_amount}` : ""}`,
            },
        })

        return NextResponse.json({ status: "success" }, { status: 200 })
    } catch (error) {
        console.error("Steadfast webhook error:", error)
        return NextResponse.json({ error: error.message || "Webhook error" }, { status: 400 })
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: "Steadfast webhook endpoint" })
}
