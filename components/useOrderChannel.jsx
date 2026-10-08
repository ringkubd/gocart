'use client'
import { useEffect, useRef, useState } from "react"
import Pusher from "pusher-js"

const SOKETI_KEY = process.env.NEXT_PUBLIC_SOKETI_KEY || "mcnftzihiahoqrjvyaqk"
const SOKETI_HOST = process.env.NEXT_PUBLIC_SOKETI_HOST || "ws.isdb-bisew.org"

// Subscribe to a single order's channel for live status updates.
export function useOrderChannel(orderId) {
    const [update, setUpdate] = useState(null)
    const pusherRef = useRef(null)

    useEffect(() => {
        if (!orderId) return
        try {
            const pusher = new Pusher(SOKETI_KEY, {
                cluster: "mt1",
                wsHost: SOKETI_HOST,
                wssPort: 443,
                wsPort: 443,
                forceTLS: true,
            })
            pusherRef.current = pusher
            const channel = pusher.subscribe(`order-${orderId}`)
            channel.bind("status-update", (data) => setUpdate({ ...data, _at: Date.now() }))
        } catch (e) {}
        return () => {
            try { pusherRef.current?.disconnect() } catch (e) {}
            pusherRef.current = null
        }
    }, [orderId])

    return update
}
