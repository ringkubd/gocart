'use client'
import { useDispatch, useSelector } from "react-redux"
import { setCurrency } from "@/lib/features/currency/currencySlice"

export function useCurrency() {
    const dispatch = useDispatch()
    const { code, symbol, rates, list } = useSelector(state => state.currency)

    const rate = rates[code] || 1

    const convert = (amount) => {
        const n = Number(amount) || 0
        return n * rate
    }

    const format = (amount, decimals = 2) => {
        const n = convert(amount)
        return `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })}`
    }

    const formatRaw = (amount, decimals = 2) => {
        const n = convert(amount)
        return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
    }

    const setCurrencyCode = (newCode, newSymbol) => {
        dispatch(setCurrency({ code: newCode, symbol: newSymbol }))
        try { localStorage.setItem('gocart_currency', JSON.stringify(newCode)) } catch (e) {}
    }

    return { code, symbol, rate, convert, format, formatRaw, setCurrencyCode, list }
}
