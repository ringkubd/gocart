import { headers } from "next/headers"

export const SITE = "https://thedhakashop.com"

// Current locale for a server component / generateMetadata.
// Set by middleware: /bn/* requests carry `x-locale: bn`.
export async function getLocale() {
    try {
        const h = await headers()
        return h.get("x-locale") === "bn" ? "bn" : "en"
    } catch {
        return "en"
    }
}

// Build canonical + hreflang alternates for a given English path (e.g. "/shop").
export function buildAlternates(enPath, locale = "en") {
    const clean = enPath === "/" ? "" : enPath
    const en = `${SITE}${clean || "/"}`
    const bn = `${SITE}/bn${clean}`
    return {
        canonical: locale === "bn" ? bn : en,
        languages: {
            en,
            bn,
            "x-default": en,
        },
    }
}

// Pick a localized value with English fallback.
export function pick(locale, bnValue, enValue) {
    if (locale === "bn") return bnValue || enValue
    return enValue || bnValue
}
