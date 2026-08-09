import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            include: { rating: true, brand: true },
            orderBy: { createdAt: "desc" },
        })

        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                user: { select: { name: true, email: true } },
                address: true,
                orderItems: { include: { product: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        const totalEarnings = orders
            .filter(o => o.status !== "ORDER_PLACED" && o.status !== "CANCELLED")
            .reduce((sum, o) => sum + o.total, 0)

        // Revenue by day (last 14 days) for chart
        const revenueByDay = {}
        const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
        orders
            .filter(o => o.status !== "CANCELLED" && new Date(o.createdAt).getTime() >= fourteenDaysAgo)
            .forEach((o) => {
                const day = new Date(o.createdAt).toISOString().split('T')[0]
                revenueByDay[day] = (revenueByDay[day] || 0) + o.total
            })

        const statusBreakdown = {}
        orders.forEach((o) => {
            statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1
        })

        const ratings = products.flatMap(p => p.rating)

        return NextResponse.json({
            store,
            products,
            orders,
            dashboardData: {
                totalProducts: products.length,
                totalEarnings,
                totalOrders: orders.length,
                ratings,
                revenueByDay,
                statusBreakdown,
            },
        })
    } catch (error) {
        console.error("Store dashboard error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
