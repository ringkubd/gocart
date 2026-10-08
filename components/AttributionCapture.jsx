"use client"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { attrFromLocation, storeAttribution } from "@/lib/attribution"

// Captures first-touch marketing attribution (utm/gclid/referrer) on any public page
// and stores it in a 30-day cookie for use at checkout.
export default function AttributionCapture() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (typeof window === "undefined") return
        const attr = attrFromLocation(window.location.search, document.referrer, pathname)
        storeAttribution(attr)
    }, [pathname, searchParams])

    return null
}
