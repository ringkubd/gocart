'use client'
import { useEffect, useRef, useState } from "react"
import Pusher from "pusher-js"

const SOKETI_KEY = process.env.NEXT_PUBLIC_SOKETI_KEY || "mcnftzihiahoqrjvyaqk"
const SOKETI_HOST = process.env.NEXT_PUBLIC_SOKETI_HOST || "ws.isdb-bisew.org"

// Subscribe to a support ticket channel and receive real-time messages
export function useTicketChannel(ticketId) {
    const [liveMessage, setLiveMessage] = useState(null)
    const pusherRef = useRef(null)

    useEffect(() => {
        if (!ticketId) return

        const pusher = new Pusher(SOKETI_KEY, {
            cluster: "mt1",
            wsHost: SOKETI_HOST,
            wssPort: 443,
            wsPort: 443,
            forceTLS: true,
        })
        pusherRef.current = pusher

        const channel = pusher.subscribe(`ticket-${ticketId}`)
        channel.bind("new-message", (data) => {
            setLiveMessage(data)
        })

        return () => {
            pusher.disconnect()
            pusherRef.current = null
        }
    }, [ticketId])

    return { liveMessage, clearLiveMessage: () => setLiveMessage(null) }
}
