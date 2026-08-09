import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const [products, orders, stores, users, allOrders] = await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.store.count(),
            prisma.user.count(),
            prisma.order.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    orderItems: { include: { product: true } },
                    store: { select: { id: true, name: true, username: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
        ])

        const revenue = allOrders.reduce((sum, o) => sum + o.total, 0)
        const pendingStores = await prisma.store.count({ where: { status: "pending" } })

        // Revenue by day for the last 14 days
        const revenueByDay = {}
        const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
        allOrders
            .filter(o => new Date(o.createdAt).getTime() >= fourteenDaysAgo)
            .forEach((o) => {
                const day = new Date(o.createdAt).toISOString().split('T')[0]
                revenueByDay[day] = (revenueByDay[day] || 0) + o.total
            })

        // Order status breakdown
        const statusBreakdown = {}
        allOrders.forEach((o) => {
            statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1
        })

        // Top products by sold quantity
        const topProducts = allOrders
            .flatMap(o => o.orderItems)
            .reduce((acc, item) => {
                const found = acc.find(p => p.id === item.productId)
                if (found) {
                    found.qty += item.quantity
                } else {
                    acc.push({ id: item.productId, name: item.product.name, image: item.product.images?.[0] || '', qty: item.quantity, price: item.product.price })
                }
                return acc
            }, [])
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5)

        // Top stores by revenue
        const topStores = allOrders
            .reduce((acc, o) => {
                const found = acc.find(s => s.id === o.storeId)
                if (found) {
                    found.revenue += o.total
                    found.orders += 1
                } else {
                    acc.push({ id: o.storeId, name: o.store.name, username: o.store.username, revenue: o.total, orders: 1 })
                }
                return acc
            }, [])
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        const storesList = await prisma.store.findMany({
            include: {
                user: { select: { name: true, image: true } },
                _count: { select: { Product: true, Order: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({
            dashboardData: {
                products,
                revenue,
                orders,
                stores,
                users,
                pendingStores,
                revenueByDay,
                statusBreakdown,
                topProducts,
                topStores,
                recentOrders: allOrders.slice(0, 10),
            },
            storesList,
        })
    } catch (error) {
        console.error("Admin dashboard error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
