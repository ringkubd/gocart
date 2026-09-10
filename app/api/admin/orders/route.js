import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { createManualOrder } from "@/lib/manualOrder"

export async function GET(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status") || ""
        const storeId = searchParams.get("storeId") || ""
        const search = searchParams.get("search") || ""
        const page = parseInt(searchParams.get("page") || "1")
        const pageSize = parseInt(searchParams.get("pageSize") || "20")

        const where = {}
        if (status) {
            where.status = status
        }
        if (storeId) {
            where.storeId = storeId
        }
        if (search) {
            where.OR = [
                { user: { name: { contains: search } } },
                { user: { email: { contains: search } } },
                { trackingNumber: { contains: search } },
            ]
        }

        const total = await prisma.order.count({ where })
        const orders = await prisma.order.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                store: { select: { id: true, name: true, username: true } },
                address: true,
                orderItems: {
                    include: { product: { select: { id: true, name: true, images: true, price: true } }, variant: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })

        return NextResponse.json({ orders, total, page, pageSize })
    } catch (error) {
        console.error("Admin orders GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        const body = await req.json()
        const order = await createManualOrder({
            storeId: body.storeId,
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
        console.error("Admin manual order error:", error)
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: error.statusCode || 500 })
    }
}
