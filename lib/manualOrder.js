import { prisma } from "@/lib/prisma"

const ORDER_SOURCES = ["WEBSITE", "PHONE", "MESSENGER", "WHATSAPP", "IMO", "IN_PERSON", "OTHER"]
const CREATABLE_STATUSES = ["ORDER_PLACED", "PROCESSING"]
const PAYMENT_METHODS = ["COD", "BKASH", "NAGAD", "SSLCOM", "STRIPE", "OTHER"]

const isFreeProduct = (p) => p.freeDelivery || Number(p.deliveryCost || 0) <= 0

export async function createManualOrder(input) {
    const {
        storeId,
        items,
        customer,
        address,
        paymentMethod = "COD",
        isPaid = false,
        transactionId = "",
        couponCode = "",
        manualDiscount = 0,
        shippingMethodId = "",
        manualShippingCost,
        status = "ORDER_PLACED",
        source = "PHONE",
        customerNote = "",
        note = "",
    } = input

    if (!storeId) throw Object.assign(new Error("Store is required"), { statusCode: 400 })
    if (!items?.length) throw Object.assign(new Error("Add at least one product"), { statusCode: 400 })
    if (!customer?.name?.trim()) throw Object.assign(new Error("Customer name is required"), { statusCode: 400 })
    if (!customer?.phone?.trim()) throw Object.assign(new Error("Customer phone is required"), { statusCode: 400 })
    if (!address?.street?.trim() || !address?.city?.trim() || !address?.state?.trim() || !address?.zip?.trim()) {
        throw Object.assign(new Error("Full delivery address is required"), { statusCode: 400 })
    }

    const cleanStatus = CREATABLE_STATUSES.includes(status) ? status : "ORDER_PLACED"
    const cleanPayment = PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : "COD"
    const cleanSource = ORDER_SOURCES.includes(source) ? source : "PHONE"

    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) throw Object.assign(new Error("Store not found"), { statusCode: 404 })

    const productIds = [...new Set(items.map((i) => i.productId).filter(Boolean))]
    if (!productIds.length) throw Object.assign(new Error("Invalid products"), { statusCode: 400 })

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { variants: true },
    })

    // Validate items + resolve server-side unit prices
    const resolvedItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) throw Object.assign(new Error("Product not found"), { statusCode: 404 })
        if (product.storeId !== storeId) throw Object.assign(new Error(`"${product.name}" does not belong to this store`), { statusCode: 400 })
        const quantity = Number(item.quantity) || 0
        if (quantity < 1) throw Object.assign(new Error(`Invalid quantity for "${product.name}"`), { statusCode: 400 })

        let variant = null
        if (item.variantId) {
            variant = product.variants.find((v) => v.id === item.variantId)
            if (!variant) throw Object.assign(new Error(`Variant not found for "${product.name}"`), { statusCode: 404 })
            if (variant.stock > 0 && variant.stock < quantity) {
                throw Object.assign(new Error(`Not enough stock for "${product.name}" (${Object.values(variant.attributes || {}).join(", ")})`), { statusCode: 400 })
            }
        } else if (product.hasVariants) {
            throw Object.assign(new Error(`Please select a variant for "${product.name}"`), { statusCode: 400 })
        } else if (product.stock > 0 && product.stock < quantity) {
            throw Object.assign(new Error(`Not enough stock for "${product.name}"`), { statusCode: 400 })
        }

        const dbPrice = variant ? variant.price : product.price
        const unitPrice = item.price !== undefined && item.price !== "" && Number(item.price) >= 0
            ? Number(item.price)
            : Number(dbPrice) || 0

        return { product, variant, quantity, unitPrice }
    })

    const subtotal = resolvedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const totalItemQty = resolvedItems.reduce((sum, i) => sum + i.quantity, 0)

    // Coupon (same rules as website checkout)
    let couponDiscount = 0
    let appliedCoupon = {}
    let isCouponUsed = false
    if (couponCode?.trim()) {
        const found = await prisma.coupon.findUnique({ where: { code: couponCode.trim() } })
        if (found && found.isPublic && new Date(found.expiresAt) > new Date()) {
            couponDiscount = (found.discount / 100) * subtotal
            appliedCoupon = found
            isCouponUsed = true
        }
    }

    const cleanManualDiscount = Math.max(0, Math.min(Number(manualDiscount) || 0, subtotal - couponDiscount))

    // Product delivery charges (unified free rule)
    let productDeliveryTotal = 0
    for (const item of resolvedItems) {
        const product = item.product
        if (isFreeProduct(product)) continue
        let itemDelivery = Number(product.deliveryCost || 0) * item.quantity
        if (product.minQtyForFree > 0 && item.quantity >= product.minQtyForFree) itemDelivery = 0
        if (product.deliveryDiscount > 0) itemDelivery = itemDelivery * (1 - product.deliveryDiscount / 100)
        productDeliveryTotal += itemDelivery
    }

    // Global free-delivery rules
    let minimumOrderFreeDelivery = 0
    let bundleFreeQty = 0
    try {
        const minSetting = await prisma.siteSetting.findUnique({ where: { key: "minimumOrderFreeDelivery" } })
        if (minSetting?.value) minimumOrderFreeDelivery = Number(minSetting.value)
        const bundleSetting = await prisma.siteSetting.findUnique({ where: { key: "bundleFreeQty" } })
        if (bundleSetting?.value) bundleFreeQty = Number(bundleSetting.value)
    } catch (e) { }
    if (minimumOrderFreeDelivery > 0 && subtotal >= minimumOrderFreeDelivery) productDeliveryTotal = 0
    if (bundleFreeQty > 0 && totalItemQty >= bundleFreeQty) productDeliveryTotal = 0

    // Shipping: manual override wins, else method cost; waived when all items free
    let shippingCost = 0
    let shippingName = ""
    if (manualShippingCost !== undefined && manualShippingCost !== "" && manualShippingCost !== null) {
        shippingCost = Math.max(0, Number(manualShippingCost) || 0)
        if (shippingMethodId) {
            const method = await prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } })
            if (method) shippingName = method.name
        }
    } else if (shippingMethodId) {
        const method = await prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } })
        if (method && method.active) {
            shippingCost = method.cost
            shippingName = method.name
        }
    }

    const allFreeDelivery = products.length > 0 && products.every(isFreeProduct)
    if (allFreeDelivery) shippingCost = 0

    const total = Math.max(0, subtotal - couponDiscount - cleanManualDiscount + shippingCost + productDeliveryTotal)

    // Link existing active customer by email (if given), else guest
    let buyerUser = null
    if (customer.email?.trim()) {
        try {
            const existing = await prisma.user.findUnique({ where: { email: customer.email.trim() } })
            if (existing && existing.active) buyerUser = existing
        } catch (e) { buyerUser = null }
    }

    const savedAddress = await prisma.address.create({
        data: {
            userId: buyerUser?.id || null,
            name: customer.name.trim(),
            email: customer.email?.trim() || "",
            street: address.street.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            zip: address.zip.trim(),
            country: address.country?.trim() || "Bangladesh",
            phone: customer.phone.trim(),
        },
    })

    const now = new Date()
    const year = now.getFullYear()
    const seqKey = `order_seq_${year}`
    const seqRow = await prisma.siteSetting.findUnique({ where: { key: seqKey } })
    const nextNum = (seqRow?.value || 0) + 1
    const orderNumber = `${year}-${String(nextNum).padStart(6, "0")}`
    await prisma.siteSetting.upsert({
        where: { key: seqKey },
        update: { value: nextNum },
        create: { key: seqKey, value: nextNum },
    })

    const orderTimestamps = {}
    if (cleanStatus === "PROCESSING") orderTimestamps.shippedAt = undefined

    const order = await prisma.order.create({
        data: {
            orderNumber,
            total: Number(total.toFixed(2)),
            shippingCost,
            shippingMethod: shippingName,
            userId: buyerUser?.id || null,
            guestName: buyerUser ? "" : customer.name.trim(),
            guestEmail: buyerUser ? "" : (customer.email?.trim() || ""),
            guestPhone: buyerUser ? "" : customer.phone.trim(),
            storeId,
            addressId: savedAddress.id,
            paymentMethod: cleanPayment,
            transactionId: transactionId || "",
            isPaid: Boolean(isPaid),
            isCouponUsed,
            coupon: appliedCoupon,
            status: cleanStatus,
            source: cleanSource,
            customerNote: customerNote || "",
            note: note || "",
            ...orderTimestamps,
            orderItems: {
                create: resolvedItems.map((item) => ({
                    productId: item.product.id,
                    variantId: item.variant?.id || null,
                    quantity: item.quantity,
                    price: item.unitPrice,
                })),
            },
        },
        include: {
            store: true,
            address: true,
            user: { select: { id: true, name: true, email: true, image: true } },
            orderItems: { include: { product: true, variant: true } },
        },
    })

    // Decrement stock
    for (const item of resolvedItems) {
        if (item.variant) {
            if (item.variant.stock > 0) {
                await prisma.productVariant.update({
                    where: { id: item.variant.id },
                    data: {
                        stock: { decrement: item.quantity },
                        inStock: item.variant.stock - item.quantity > 0,
                    },
                })
            }
        } else if (item.product.stock > 0) {
            await prisma.product.update({
                where: { id: item.product.id },
                data: {
                    stock: { decrement: item.quantity },
                    soldCount: { increment: item.quantity },
                },
            })
        }
    }

    await prisma.orderStatusLog.create({
        data: {
            orderId: order.id,
            status: cleanStatus,
            description: cleanSource === "WEBSITE" ? "Order has been placed successfully." : `Manual order placed via ${cleanSource}.`,
            courierName: buyerUser?.name || customer.name.trim(),
        },
    })

    return order
}

export const MANUAL_ORDER_SOURCES = ORDER_SOURCES
