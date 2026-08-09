'use client'
import { useEffect, useState } from "react"

export default function useStorefrontData() {
    const [data, setData] = useState({
        settings: {},
        slides: [],
        categories: [],
        brands: [],
        shippingMethods: [],
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/settings')
                const json = await res.json()
                if (res.ok) {
                    setData(json)
                }
            } catch (error) {
                console.error("Failed to load storefront settings:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return { ...data, loading }
}
