import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function GET() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                store: { select: { name: true, username: true } },
                address: true,
                user: { select: { name: true, email: true } },
                orderItems: {
                    include: { product: { include: { store: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ orders })
    } catch (error) {
        console.error("Orders GET error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { items, address, paymentMethod, coupon, shippingMethod, transactionId } = body

        if (!items?.length) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
        }
        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 })
        }

        // Verify all products exist and have stock
        const productIds = items.map(item => item.productId)
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
        for (const item of items) {
            const product = products.find(p => p.id === item.productId)
            if (!product) {
                return NextResponse.json({ error: `Product not found` }, { status: 404 })
            }
            if (product.stock > 0 && product.stock < item.quantity) {
                return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
            }
        }

        // Resolve shipping cost
        let shippingCost = 0
        let shippingName = ""
        if (shippingMethod?.id) {
            const method = await prisma.shippingMethod.findUnique({ where: { id: shippingMethod.id } })
            if (method && method.active) {
                shippingCost = method.cost
                shippingName = method.name
            }
        }

        // Save the address for the user
        const savedAddress = await prisma.address.create({
            data: {
                userId: user.id,
                name: address.name,
                email: address.email,
                street: address.street,
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: address.country,
                phone: address.phone,
            },
        })

        // All items belong to one store (single-store checkout)
        const product = products[0]

        let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

        let discount = 0
        let appliedCoupon = {}
        let isCouponUsed = false

        if (coupon?.code) {
            const found = await prisma.coupon.findUnique({ where: { code: coupon.code } })
            if (found && found.isPublic && new Date(found.expiresAt) > new Date()) {
                discount = (found.discount / 100) * subtotal
                appliedCoupon = found
                isCouponUsed = true
            }
        }

        const total = subtotal - discount + shippingCost

        const order = await prisma.order.create({
            data: {
                total: Number(total.toFixed(2)),
                shippingCost,
                shippingMethod: shippingName,
                userId: user.id,
                storeId: product.storeId,
                addressId: savedAddress.id,
                paymentMethod: paymentMethod || "COD",
                transactionId: transactionId || "",
                isCouponUsed,
                coupon: appliedCoupon,
                orderItems: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                store: true,
                address: true,
                user: { select: { id: true, name: true, email: true, image: true } },
                orderItems: { include: { product: true } },
            },
        })

        // Decrement stock + increment sold count for each product
        for (const item of items) {
            const prod = products.find(p => p.id === item.productId)
            if (prod.stock > 0) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                        soldCount: { increment: item.quantity },
                    },
                })
            }
        }

        return NextResponse.json({ order }, { status: 201 })
    } catch (error) {
        console.error("Orders POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
