import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { steadfastGetReturns, steadfastCreateReturn } from "@/lib/couriers/steadfast"

function normalizeList(data) {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.returns)) return data.returns
    return []
}

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        try {
            const data = await steadfastGetReturns()
            return NextResponse.json({ returns: normalizeList(data), raw: data })
        } catch (e) {
            return NextResponse.json({ returns: [], error: e.message }, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

// Create a return request for an order
export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const { orderId, reason } = body
        if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })

        const order = await prisma.order.findUnique({ where: { id: orderId } })
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
        if (!order.courierConsignmentId && !order.orderNumber) {
            return NextResponse.json({ error: "Order has no consignment/invoice to return" }, { status: 400 })
        }

        let result
        try {
            result = await steadfastCreateReturn({
                consignmentId: order.courierConsignmentId || undefined,
                invoice: order.orderNumber || undefined,
                reason: reason || "",
            })
        } catch (e) {
            return NextResponse.json({ error: e.message || "Steadfast error" }, { status: e.statusCode || 400 })
        }

        await prisma.orderStatusLog.create({
            data: {
                orderId,
                status: order.status,
                description: "Return request sent to Steadfast.",
                courierName: "Steadfast",
                courierNote: `Return ID: ${result?.id || "—"}${reason ? ` · ${reason}` : ""}`,
            },
        })

        return NextResponse.json({ return: result }, { status: 201 })
    } catch (error) {
        console.error("Create return error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
