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

        const body = await req.json()
        const { items, address, paymentMethod, coupon, shippingMethod, transactionId } = body

        if (!items?.length) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
        }
        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 })
        }
        if (!user && !address.name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
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

        // Calculate product delivery charges
        let productDeliveryTotal = 0
        let totalItemQty = items.reduce((sum, item) => sum + item.quantity, 0)

        for (const item of items) {
            const product = products.find(p => p.id === item.productId)
            if (product) {
                if (!product.freeDelivery) {
                    let itemDelivery = product.deliveryCost * item.quantity
                    if (product.minQtyForFree > 0 && item.quantity >= product.minQtyForFree) {
                        itemDelivery = 0
                    }
                    if (product.deliveryDiscount > 0) {
                        itemDelivery = itemDelivery * (1 - product.deliveryDiscount / 100)
                    }
                    productDeliveryTotal += itemDelivery
                }
            }
        }

        // Fetch global delivery settings
        let minimumOrderFreeDelivery = 0
        let bundleFreeQty = 0
        try {
            const minSetting = await prisma.siteSetting.findUnique({ where: { key: "minimumOrderFreeDelivery" } })
            if (minSetting?.value) minimumOrderFreeDelivery = Number(minSetting.value)
            const bundleSetting = await prisma.siteSetting.findUnique({ where: { key: "bundleFreeQty" } })
            if (bundleSetting?.value) bundleFreeQty = Number(bundleSetting.value)
        } catch (e) { }

        // Apply global free delivery rules
        if (minimumOrderFreeDelivery > 0 && subtotal >= minimumOrderFreeDelivery) {
            productDeliveryTotal = 0
        }
        if (bundleFreeQty > 0 && totalItemQty >= bundleFreeQty) {
            productDeliveryTotal = 0
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

        // If all items have freeDelivery, waive shipping method cost too
        const allFreeDelivery = products.length > 0 && products.every(p => p.freeDelivery)
        if (allFreeDelivery) shippingCost = 0

        // Guest checkout: optionally create/attach a real user account silently from the email
        let buyerUser = user
        let guestName = ""
        let guestEmail = ""
        let guestPhone = ""
        if (!buyerUser) {
            guestName = address.name || ""
            guestEmail = address.email || ""
            guestPhone = address.phone || ""

            if (address.email) {
                // Auto-create account from guest email for order tracking
                let existing = null
                try {
                    existing = await prisma.user.findUnique({ where: { email: address.email } })
                } catch (e) { existing = null }

                if (existing && existing.active) {
                    buyerUser = existing
                } else if (existing && !existing.active) {
                    // skip — will be saved as guest
                } else {
                    const userRole = await prisma.role.findUnique({ where: { name: "user" } })
                    try {
                        buyerUser = await prisma.user.create({
                            data: {
                                name: address.name || "Guest",
                                email: address.email,
                                password: "",
                                role: "user",
                                roleId: userRole?.id || null,
                                active: true,
                                cart: {},
                            },
                        })
                    } catch (e) {
                        // Race condition — treat as guest
                        buyerUser = null
                    }
                }
            }
        }

        // Save the address (linked to user if one exists, else standalone for guest)
        const savedAddress = await prisma.address.create({
            data: {
                userId: buyerUser?.id || null,
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

        const total = subtotal - discount + shippingCost + productDeliveryTotal

        // Generate order number: YYYY-NNNNNN
        const now = new Date()
        const year = now.getFullYear()
        const seqKey = `order_seq_${year}`
        const seqRow = await prisma.siteSetting.findUnique({ where: { key: seqKey } })
        const nextNum = (seqRow?.value || 0) + 1
        const orderNumber = `${year}-${String(nextNum).padStart(6, '0')}`

        await prisma.siteSetting.upsert({
            where: { key: seqKey },
            update: { value: nextNum },
            create: { key: seqKey, value: nextNum },
        })

        const order = await prisma.order.create({
            data: {
                orderNumber,
                total: Number(total.toFixed(2)),
                shippingCost,
                shippingMethod: shippingName,
                userId: buyerUser?.id || null,
                guestName,
                guestEmail,
                guestPhone,
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

        // Create initial status log
        await prisma.orderStatusLog.create({
            data: {
                orderId: order.id,
                status: "ORDER_PLACED",
                description: "Order has been placed successfully.",
                courierName: buyerUser?.name || guestName || "",
            },
        })

        return NextResponse.json({
            order,
            ...(buyerUser && !user ? { autoAccount: true, accountEmail: buyerUser.email } : {}),
        }, { status: 201 })
    } catch (error) {
        console.error("Orders POST error:", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
