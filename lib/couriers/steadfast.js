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

export async function steadfastStatusByTrackingCode(trackingCode) {
    return steadfastFetch(`/status_by_trackingcode/${encodeURIComponent(trackingCode)}`)
}

export async function steadfastStatusByInvoice(invoice) {
    return steadfastFetch(`/status_by_invoice/${encodeURIComponent(invoice)}`)
}

// Build the Steadfast payload from an order (with address included).
export function buildSteadfastPayload(order) {
    const a = order.address || {}
    const address = [a.street, a.city, a.state, a.zip, a.country].filter(Boolean).join(", ")
    const phone = a.phone || order.guestPhone || ""
    return {
        invoice: order.orderNumber || order.id.slice(-8),
        recipient_name: order.guestName || order.user?.name || a.name || "Customer",
        recipient_phone: phone,
        recipient_address: address,
        cod_amount: order.isPaid ? 0 : Number(order.total) || 0,
        note: order.customerNote || order.note || "",
    }
}
