import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public order tracking: ?orderNumber=YYYY-000001&contact=<phone or email>
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const orderNumber = (searchParams.get("orderNumber") || "").trim()
        const contact = (searchParams.get("contact") || "").trim()

        if (!orderNumber || !contact) {
            return NextResponse.json({ error: "Order number and phone/email are required" }, { status: 400 })
        }

        const order = await prisma.order.findFirst({
            where: { orderNumber },
            include: {
                address: true,
                store: { select: { name: true, username: true } },
                orderItems: { include: { product: true, variant: true } },
                statusLogs: { orderBy: { createdAt: "asc" } },
            },
        })

        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

        const digits = (s) => String(s || "").replace(/\D/g, "")
        const contactDigits = digits(contact)
        const phones = [order.address?.phone, order.guestPhone].map(digits).filter(Boolean)
        const emails = [order.address?.email, order.guestEmail].map(e => String(e || "").toLowerCase()).filter(Boolean)

        const phoneMatch = contactDigits.length >= 6 && phones.some(p => p === contactDigits || p.endsWith(contactDigits) || contactDigits.endsWith(p))
        const emailMatch = emails.includes(contact.toLowerCase())

        if (!phoneMatch && !emailMatch) {
            return NextResponse.json({ error: "Order not found for this phone/email" }, { status: 404 })
        }

        return NextResponse.json({
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                shippingCost: order.shippingCost,
                paymentMethod: order.paymentMethod,
                isPaid: order.isPaid,
                courierName: order.courierName,
                trackingNumber: order.trackingNumber,
                createdAt: order.createdAt,
                shippedAt: order.shippedAt,
                deliveredAt: order.deliveredAt,
                cancelledAt: order.cancelledAt,
                store: order.store,
                address: order.address,
                orderItems: order.orderItems,
                statusLogs: order.statusLogs,
            },
        })
    } catch (error) {
        console.error("Track order error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
