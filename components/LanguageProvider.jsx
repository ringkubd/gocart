'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { translations } from "@/lib/i18n/translations"

const LanguageContext = createContext()

// Separate language setting per area:
// - storefront / public  -> gocart_lang_public
// - store dashboard      -> gocart_lang_store
// - admin dashboard      -> gocart_lang_admin
function getScope(pathname) {
    const p = (pathname || "").replace(/^\/bn(?=\/|$)/, "")
    if (p.startsWith("/admin")) return "admin"
    if (p.startsWith("/store")) return "store"
    return "public"
}

function getKey(scope) {
    return `gocart_lang_${scope}`
}

export function LanguageProvider({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const [lang, setLang] = useState("en")
    const [scope, setScope] = useState("public")

    // When the area (scope) changes, load that area's saved language.
    // A `/bn` URL prefix forces Bangla for the public storefront.
    useEffect(() => {
        const current = getScope(pathname)
        setScope(current)
        if (pathname === "/bn" || pathname?.startsWith("/bn/")) {
            setLang("bn")
            return
        }
        let saved = null
        try { saved = localStorage.getItem(getKey(current)) } catch (e) {}
        setLang(saved === "bn" ? "bn" : "en")
    }, [pathname])

    const changeLanguage = useCallback((code) => {
        const next = code === "bn" ? "bn" : "en"
        setLang(next)
        try { localStorage.setItem(getKey(scope), next) } catch (e) {}

        // On the public storefront, keep the URL locale prefix in sync (SEO-friendly URLs)
        if (scope === "public" && pathname) {
            const isBn = pathname === "/bn" || pathname.startsWith("/bn/")
            const base = pathname.replace(/^\/bn(?=\/|$)/, "") || "/"
            if (next === "bn" && !isBn) {
                router.push(base === "/" ? "/bn" : `/bn${base}`)
            } else if (next === "en" && isBn) {
                router.push(base)
            }
        }
    }, [scope, pathname, router])

    const t = useCallback((key) => {
        const dict = translations[lang] || translations.en
        return dict[key] || translations.en[key] || key
    }, [lang])

    return (
        <LanguageContext.Provider value={{ lang, changeLanguage, t, scope }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) {
        return { lang: "en", changeLanguage: () => {}, t: (k) => k, scope: "public" }
    }
    return ctx
}
