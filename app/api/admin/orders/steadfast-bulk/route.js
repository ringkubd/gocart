import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { steadfastBulkCreateOrders, buildSteadfastPayload } from "@/lib/couriers/steadfast"

// Bulk send selected orders to Steadfast.
// Body: { orderIds: string[], deliveryType?: 0|1 }
export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const orderIds = Array.isArray(body.orderIds) ? body.orderIds.slice(0, 500) : []
        const deliveryType = Number(body.deliveryType) === 1 ? 1 : 0
        if (!orderIds.length) return NextResponse.json({ error: "No orders selected" }, { status: 400 })

        const orders = await prisma.order.findMany({
            where: { id: { in: orderIds } },
            include: { address: true, user: { select: { name: true } }, orderItems: { include: { product: true, variant: true } } },
        })

        const skipped = []
        const map = {}
        const payloads = []
        for (const o of orders) {
            const p = buildSteadfastPayload(o, { deliveryType })
            if (!p.recipient_phone || String(p.recipient_phone).replace(/\D/g, "").length !== 11) {
                skipped.push({ orderId: o.id, orderNumber: o.orderNumber, reason: "invalid phone" })
                continue
            }
            map[p.invoice] = o
            payloads.push(p)
        }

        if (!payloads.length) {
            return NextResponse.json({ sent: 0, skipped, results: [] })
        }

        let results = []
        try {
            const data = await steadfastBulkCreateOrders(payloads)
            results = Array.isArray(data) ? data : (data?.data || [])
        } catch (e) {
            return NextResponse.json({ error: e.message || "Steadfast bulk error" }, { status: e.statusCode || 400 })
        }

        let sent = 0
        const out = []
        for (const r of results) {
            const o = map[r.invoice]
            out.push({ invoice: r.invoice, status: r.status, tracking_code: r.tracking_code, consignment_id: r.consignment_id, orderNumber: o?.orderNumber })
            if (r.status === "success" && o) {
                sent++
                await prisma.order.update({
                    where: { id: o.id },
                    data: {
                        courierName: "Steadfast",
                        trackingNumber: r.tracking_code || o.trackingNumber,
                        courierConsignmentId: r.consignment_id ? String(r.consignment_id) : o.courierConsignmentId,
                    },
                })
                await prisma.orderStatusLog.create({
                    data: {
                        orderId: o.id,
                        status: o.status,
                        description: "Sent to Steadfast (bulk).",
                        courierName: "Steadfast",
                        courierNote: `Consignment ID: ${r.consignment_id || "—"}${r.tracking_code ? ` · Tracking: ${r.tracking_code}` : ""}`,
                    },
                })
            }
        }

        return NextResponse.json({ sent, total: payloads.length, skipped, results: out })
    } catch (error) {
        console.error("Steadfast bulk error:", error)
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 })
    }
}
