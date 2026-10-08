// Marketing attribution: capture (client) + derive traffic source (server/client).
// First-touch is stored in a 30-day cookie `gocart_attr`.

export const ATTR_COOKIE = "gocart_attr"
export const ATTR_DAYS = 30

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
const CLICK_IDS = ["gclid", "fbclid", "msclkid", "ttclid", "wbraid", "gbraid"]

// Derive a human-friendly traffic bucket from attribution signals.
export function deriveTrafficType(attr = {}) {
    const src = (attr.utmSource || "").toLowerCase()
    const med = (attr.utmMedium || "").toLowerCase()
    const ref = (attr.referrer || "").toLowerCase()

    if (attr.gclid || attr.gbraid || attr.wbraid) return "google_ads"
    if (attr.msclkid) return "bing_ads"
    if (attr.fbclid) return "facebook"
    if (src.includes("google")) return med === "organic" ? "google_organic" : "google"
    if (src.includes("facebook") || src === "fb") return "facebook"
    if (src.includes("instagram") || src === "ig") return "instagram"
    if (src) return src
    if (ref.includes("google.")) return "google_organic"
    if (ref.includes("facebook.") || ref.includes("fb.")) return "facebook"
    if (ref.includes("bing.")) return "bing"
    if (ref.includes("instagram.")) return "instagram"
    if (ref) return "referral"
    return "direct"
}

function emptyAttr() {
    return {
        utmSource: "", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "",
        gclid: "", fbclid: "", referrer: "", landingPage: "",
    }
}

// Parse URL search + referrer into an attribution object.
export function attrFromLocation(search = "", referrer = "", pathname = "") {
    const attr = emptyAttr()
    try {
        const params = new URLSearchParams(search || "")
        const map = {
            utm_source: "utmSource", utm_medium: "utmMedium", utm_campaign: "utmCampaign",
            utm_term: "utmTerm", utm_content: "utmContent",
            gclid: "gclid", fbclid: "fbclid", msclkid: "fbclid",
        }
        UTM_KEYS.forEach(k => { const v = params.get(k); if (v) attr[map[k]] = v })
        CLICK_IDS.forEach(k => { const v = params.get(k); if (v && (k === "gclid" || k === "fbclid")) attr[k] = v })
        if (referrer) attr.referrer = referrer
        if (pathname) attr.landingPage = pathname
    } catch (e) {}
    return attr
}

// Read the stored first-touch attribution (browser only).
export function readStoredAttribution() {
    if (typeof document === "undefined") return emptyAttr()
    try {
        const raw = document.cookie.split("; ").find(c => c.startsWith(`${ATTR_COOKIE}=`))
        if (!raw) return emptyAttr()
        const value = decodeURIComponent(raw.split("=").slice(1).join("="))
        return { ...emptyAttr(), ...JSON.parse(value) }
    } catch (e) {
        return emptyAttr()
    }
}

// Store first-touch attribution (browser only). Keeps the earliest source.
export function storeAttribution(attr) {
    if (typeof document === "undefined") return
    try {
        const existing = readStoredAttribution()
        const hasExisting = existing.utmSource || existing.gclid || existing.fbclid || existing.referrer
        let merged = hasExisting ? existing : attr
        // Always keep a gclid/fbclid if newly seen
        if (!merged.gclid && attr.gclid) merged = { ...merged, gclid: attr.gclid }
        if (!merged.fbclid && attr.fbclid) merged = { ...merged, fbclid: attr.fbclid }
        const maxAge = ATTR_DAYS * 24 * 60 * 60
        document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(JSON.stringify(merged))}; max-age=${maxAge}; path=/; samesite=lax`
    } catch (e) {}
}
