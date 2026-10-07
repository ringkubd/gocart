// Lightweight analytics helper: pushes GA4 (via GTM dataLayer) and Meta Pixel events.
// Safe on server (no-op) and when GTM/Pixel are not configured.

export const CURRENCY = "BDT"

function push(event, params) {
    if (typeof window === "undefined") return
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...params })
}

function fb(event, params) {
    if (typeof window === "undefined") return
    if (typeof window.fbq === "function") window.fbq("track", event, params)
}

export function trackViewItem(product) {
    const price = Number(product?.price) || 0
    push("view_item", {
        currency: CURRENCY,
        value: price,
        items: [{
            item_id: product?.id,
            item_name: product?.name,
            item_category: product?.category,
            item_brand: product?.brand?.name,
            price,
            quantity: 1,
        }],
    })
    fb("ViewContent", { content_ids: [product?.id], content_type: "product", value: price, currency: CURRENCY })
}

export function trackAddToCart(product, quantity = 1) {
    const price = Number(product?.price) || 0
    push("add_to_cart", {
        currency: CURRENCY,
        value: price * quantity,
        items: [{
            item_id: product?.id,
            item_name: product?.name,
            item_category: product?.category,
            item_brand: product?.brand?.name,
            price,
            quantity,
        }],
    })
    fb("AddToCart", { content_ids: [product?.id], content_type: "product", value: price * quantity, currency: CURRENCY })
}

export function trackBeginCheckout(items, value) {
    push("begin_checkout", {
        currency: CURRENCY,
        value: Number(value) || 0,
        items: (items || []).map(i => ({
            item_id: i.id || i.productId,
            item_name: i.name || i.productName,
            price: Number(i.cartPrice || i.price) || 0,
            quantity: i.quantity || 1,
        })),
    })
    fb("InitiateCheckout", { value: Number(value) || 0, currency: CURRENCY, num_items: (items || []).length })
}

export function trackPurchase(order) {
    const items = (order?.orderItems || []).map(i => ({
        item_id: i.productId || i.product?.id,
        item_name: i.product?.name,
        price: Number(i.price) || 0,
        quantity: i.quantity || 1,
    }))
    const value = Number(order?.total) || 0
    push("purchase", {
        transaction_id: order?.orderNumber || order?.id,
        currency: CURRENCY,
        value,
        tax: Number(order?.shippingCost) || 0,
        shipping: Number(order?.shippingCost) || 0,
        items,
    })
    fb("Purchase", { value, currency: CURRENCY, content_ids: items.map(i => i.item_id), content_type: "product" })
}
