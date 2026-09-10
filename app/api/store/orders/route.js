import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { createManualOrder } from "@/lib/manualOrder"

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

        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                user: { select: { name: true, email: true } },
                address: true,
                orderItems: { include: { product: true, variant: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ orders })
    } catch (error) {
        console.error("Store orders error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return NextResponse.json({ error: "No store found" }, { status: 404 })
        }
        const body = await req.json()
        const order = await createManualOrder({
            storeId: store.id,
            items: body.items,
            customer: body.customer,
            address: body.address,
            paymentMethod: body.paymentMethod,
            isPaid: body.isPaid,
            transactionId: body.transactionId,
            couponCode: body.couponCode,
            manualDiscount: body.manualDiscount,
            shippingMethodId: body.shippingMethodId,
            manualShippingCost: body.manualShippingCost,
            status: body.status,
            source: body.source,
            customerNote: body.customerNote,
            note: body.note,
        })
        return NextResponse.json({ order }, { status: 201 })
    } catch (error) {
        console.error("Store manual order error:", error)
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: error.statusCode || 500 })
    }
}
