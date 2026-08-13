'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { translations } from "@/lib/i18n/translations"

const LanguageContext = createContext()

// Separate language setting per area:
// - storefront / public  -> gocart_lang_public
// - store dashboard      -> gocart_lang_store
// - admin dashboard      -> gocart_lang_admin
function getScope(pathname) {
    if (pathname?.startsWith("/admin")) return "admin"
    if (pathname?.startsWith("/store")) return "store"
    return "public"
}

function getKey(scope) {
    return `gocart_lang_${scope}`
}

export function LanguageProvider({ children }) {
    const pathname = usePathname()
    const [lang, setLang] = useState("en")
    const [scope, setScope] = useState("public")

    // When the area (scope) changes, load that area's saved language
    useEffect(() => {
        const current = getScope(pathname)
        setScope(current)
        let saved = null
        try { saved = localStorage.getItem(getKey(current)) } catch (e) {}
        setLang(saved === "bn" ? "bn" : saved === "en" ? "en" : "en")
    }, [pathname])

    const changeLanguage = useCallback((code) => {
        const next = code === "bn" ? "bn" : "en"
        setLang(next)
        try { localStorage.setItem(getKey(scope), next) } catch (e) {}
    }, [scope])

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
