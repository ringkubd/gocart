import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { steadfastBalance } from "@/lib/couriers/steadfast"

// Courier dashboard overview: local Steadfast stats + live balance.
export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const [total, sent, delivered, cancelled, inTransit, notSent] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { courierConsignmentId: { not: "" } } }),
            prisma.order.count({ where: { status: "DELIVERED" } }),
            prisma.order.count({ where: { status: "CANCELLED" } }),
            prisma.order.count({ where: { status: "SHIPPED" } }),
            prisma.order.count({ where: { courierConsignmentId: "", status: { in: ["ORDER_PLACED", "PROCESSING"] } } }),
        ])

        let balance = null
        try { const b = await steadfastBalance(); balance = b?.current_balance ?? null } catch (e) { balance = null }

        const recent = await prisma.order.findMany({
            where: { courierConsignmentId: { not: "" } },
            orderBy: { updatedAt: "desc" },
            take: 8,
            select: { id: true, orderNumber: true, courierName: true, trackingNumber: true, courierConsignmentId: true, status: true, updatedAt: true },
        })

        return NextResponse.json({
            stats: { total, sent, delivered, cancelled, inTransit, notSent },
            balance,
            recent,
        })
    } catch (error) {
        console.error("Logistics overview error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
