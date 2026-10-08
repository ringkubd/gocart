import { prisma } from "@/lib/prisma"

// Steadfast Courier API v1 helper.
// https://portal.packzy.com/api/v1  (Api-Key + Secret-Key headers)

const DEFAULT_BASE = "https://portal.packzy.com/api/v1"

export async function getSteadfastConfig() {
    const provider = await prisma.courierProvider.findUnique({ where: { code: "steadfast" } })
    if (!provider) return null
    return {
        apiKey: provider.apiKey,
        apiSecret: provider.apiSecret,
        baseUrl: (provider.baseUrl || DEFAULT_BASE).replace(/\/$/, ""),
        active: provider.active,
    }
}

async function steadfastFetch(path, { method = "GET", body } = {}) {
    const cfg = await getSteadfastConfig()
    if (!cfg) throw Object.assign(new Error("Steadfast not configured"), { statusCode: 400 })
    if (!cfg.apiKey || !cfg.apiSecret) throw Object.assign(new Error("Steadfast API credentials missing"), { statusCode: 400 })
    if (!cfg.active) throw Object.assign(new Error("Steadfast is disabled"), { statusCode: 400 })

    const res = await fetch(`${cfg.baseUrl}${path}`, {
        method,
        headers: {
            "Api-Key": cfg.apiKey,
            "Secret-Key": cfg.apiSecret,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: "no-store",
    })

    const text = await res.text()
    let data
    try { data = text ? JSON.parse(text) : {} } catch { data = { raw: text } }
    if (!res.ok) {
        const msg = data?.message || data?.error || `Steadfast request failed (${res.status})`
        throw Object.assign(new Error(msg), { statusCode: 400, data })
    }
    return data
}

export async function steadfastBalance() {
    return steadfastFetch("/get_balance")
}

export async function steadfastCreateOrder(payload) {
    return steadfastFetch("/create_order", { method: "POST", body: payload })
}

export async function steadfastBulkCreateOrders(orders) {
    return steadfastFetch("/create_order/bulk-order", { method: "POST", body: { data: JSON.stringify(orders) } })
}

export async function steadfastStatusByConsignmentId(consignmentId) {
    return steadfastFetch(`/status_by_cid/${encodeURIComponent(consignmentId)}`)
}

export async function steadfastStatusByTrackingCode(trackingCode) {
    return steadfastFetch(`/status_by_trackingcode/${encodeURIComponent(trackingCode)}`)
}

export async function steadfastStatusByInvoice(invoice) {
    return steadfastFetch(`/status_by_invoice/${encodeURIComponent(invoice)}`)
}

// ---- Returns ----
export async function steadfastCreateReturn({ consignmentId, invoice, trackingCode, reason } = {}) {
    const body = {}
    if (consignmentId) body.consignment_id = consignmentId
    if (invoice) body.invoice = invoice
    if (trackingCode) body.tracking_code = trackingCode
    if (reason) body.reason = reason
    return steadfastFetch("/create_return_request", { method: "POST", body })
}

export async function steadfastGetReturn(id) {
    return steadfastFetch(`/get_return_request/${encodeURIComponent(id)}`)
}

export async function steadfastGetReturns() {
    return steadfastFetch("/get_return_requests")
}

// ---- Payments ----
export async function steadfastGetPayments() {
    return steadfastFetch("/payments")
}

export async function steadfastGetPayment(id) {
    return steadfastFetch(`/payments/${encodeURIComponent(id)}`)
}

// ---- Police stations (for point/hub delivery) ----
export async function steadfastGetPoliceStations() {
    return steadfastFetch("/police_stations")
}

// ---- Fraud checker (cross-courier delivery history) ----
const FRAUD_BASE = "https://elitemart.com.bd"
export async function fraudCheck(phone) {
    const res = await fetch(`${FRAUD_BASE}/fraud-check/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
        cache: "no-store",
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(data?.message || `Fraud check failed (${res.status})`), { statusCode: 400 })
    return data
}

// Build the Steadfast payload from an order (with address + items included).
export function buildSteadfastPayload(order, opts = {}) {
    const a = order.address || {}
    const address = [a.street, a.city, a.state, a.zip, a.country].filter(Boolean).join(", ")
    const phone = a.phone || order.guestPhone || ""

    const items = (order.orderItems || [])
        .map(i => `${i.quantity}x ${i.product?.name || "Item"}${i.variant ? ` (${Object.values(i.variant.attributes || {}).join("/")})` : ""}`)
        .join(", ")
    const totalLot = (order.orderItems || []).reduce((s, i) => s + (i.quantity || 0), 0)

    return {
        invoice: order.orderNumber || order.id.slice(-8),
        recipient_name: order.guestName || order.user?.name || a.name || "Customer",
        recipient_phone: phone,
        recipient_address: address,
        cod_amount: order.isPaid ? 0 : Number(order.total) || 0,
        note: order.customerNote || order.note || "",
        ...(opts.alternativePhone ? { alternative_phone: opts.alternativePhone } : {}),
        ...(items ? { item_description: items.slice(0, 250) } : {}),
        ...(totalLot > 0 ? { total_lot: totalLot } : {}),
        delivery_type: Number(opts.deliveryType) === 1 ? 1 : 0,
    }
}
