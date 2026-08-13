'use client'
import { useLanguage } from "./LanguageProvider"

// Returns localized field based on the selected language.
// For Bangla, falls back to the English value if no Bangla translation exists.
export function useLocalized() {
    const { lang } = useLanguage()

    const isBn = lang === "bn"

    const text = (en, bn) => {
        if (isBn && bn) return bn
        return en
    }

    return { isBn, text, lang }
}
