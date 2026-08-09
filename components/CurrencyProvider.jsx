'use client'
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setCurrency, setRates, setList } from "@/lib/features/currency/currencySlice"

export default function CurrencyProvider() {
    const dispatch = useDispatch()
    const loading = useSelector(state => state.currency.loading)

    useEffect(() => {
        const init = async () => {
            try {
                // Load admin-configured currencies (base USD rates)
                const res = await fetch('/api/settings')
                const data = await res.json()
                const configured = data.settings?.currencies
                let list = []
                let rates = {}

                if (configured && Array.isArray(configured)) {
                    list = configured
                } else {
                    // Fallback defaults
                    list = [
                        { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
                        { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 110 },
                        { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83 },
                        { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
                        { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
                    ]
                }
                list.forEach(c => { rates[c.code] = c.rate })
                dispatch(setList(list))
                dispatch(setRates(rates))

                // Restore saved preference, else use admin-set default currency
                let saved = null
                try { saved = JSON.parse(localStorage.getItem('gocart_currency')) } catch (e) {}
                const defaultCode = data.settings?.defaultCurrency || list[0]?.code || 'USD'
                const effectiveCode = (saved && list.some(c => c.code === saved)) ? saved : defaultCode
                const cur = list.find(c => c.code === effectiveCode) || list[0] || { code: 'USD', symbol: '$' }
                dispatch(setCurrency({ code: cur.code, symbol: cur.symbol }))

                // Optionally refresh live rates from a free API (non-blocking)
                try {
                    const rateRes = await fetch('https://open.er-api.com/v6/latest/USD')
                    const rateData = await rateRes.json()
                    if (rateData?.rates) {
                        const liveRates = {}
                        list.forEach(c => {
                            liveRates[c.code] = rateData.rates[c.code] || c.rate
                        })
                        dispatch(setRates(liveRates))
                    }
                } catch (e) {
                    // keep configured rates
                }
            } catch (error) {
                console.error("Currency init failed:", error)
            }
        }
        init()
    }, [dispatch])

    return null
}
