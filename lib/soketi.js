import crypto from "crypto"

// Soketi server is Pusher-protocol compatible
// Endpoint: wss://ws.isdb-bisew.org (proxied to soketi :6001)
// Credentials are read from environment variables (.env) — see .env.example
export const SOKETI_APP_ID = process.env.SOKETI_APP_ID || ""
export const SOKETI_APP_KEY = process.env.SOKETI_APP_KEY || ""
export const SOKETI_APP_SECRET = process.env.SOKETI_APP_SECRET || ""
export const SOKETI_HOST = process.env.SOKETI_HOST || "ws.isdb-bisew.org"
export const SOKETI_PORT = process.env.SOKETI_PORT || "443"

const PATH = `/apps/${SOKETI_APP_ID}/events`

// Build the Pusher-compatible request signature
// string_to_sign = METHOD\nPATH\nQUERY_STRING  (query params sorted, url-encoded)
function buildAuth(method, queryParams) {
    const timestamp = Math.floor(Date.now() / 1000)
    const params = {
        auth_key: SOKETI_APP_KEY,
        auth_timestamp: String(timestamp),
        auth_version: "1.0",
        ...queryParams,
    }
    const query = Object.keys(params)
        .sort()
        .map(k => `${k}=${encodeURIComponent(params[k])}`)
        .join("&")

    const stringToSign = `${method}\n${PATH}\n${query}`
    const signature = crypto.createHmac("sha256", SOKETI_APP_SECRET).update(stringToSign).digest("hex")

    return `${query}&auth_signature=${signature}`
}

export async function triggerSupportEvent(ticketId, event, data) {
    try {
        const body = JSON.stringify({
            name: event,
            channels: [`ticket-${ticketId}`],
            data: JSON.stringify(data),
        })
        const bodyMd5 = crypto.createHash("md5").update(body).digest("hex")
        const query = buildAuth("POST", { body_md5: bodyMd5 })

        const res = await fetch(`https://${SOKETI_HOST}${PATH}?${query}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        })

        if (!res.ok) {
            const text = await res.text()
            console.error("Soketi trigger error:", res.status, text)
            return false
        }
        return true
    } catch (error) {
        console.error("Soketi trigger failed:", error)
        return false
    }
}
