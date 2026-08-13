'use client'
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { translations } from "@/lib/i18n/translations"

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState("en")

    useEffect(() => {
        let saved = null
        try { saved = localStorage.getItem("gocart_lang") } catch (e) {}
        if (saved === "en" || saved === "bn") {
            setLang(saved)
        }
    }, [])

    const changeLanguage = useCallback((code) => {
        setLang(code === "bn" ? "bn" : "en")
        try { localStorage.setItem("gocart_lang", code === "bn" ? "bn" : "en") } catch (e) {}
    }, [])

    const t = useCallback((key) => {
        const dict = translations[lang] || translations.en
        return dict[key] || translations.en[key] || key
    }, [lang])

    return (
        <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) {
        return { lang: "en", changeLanguage: () => {}, t: (k) => k }
    }
    return ctx
}
