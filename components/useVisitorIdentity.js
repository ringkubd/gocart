'use client'
import { useState, useEffect } from "react"

function generateVisitorId() {
    return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
}

export function useVisitorIdentity() {
    const [visitorId, setVisitorId] = useState('')
    const [visitorName, setVisitorName] = useState('')
    const [visitorPhone, setVisitorPhone] = useState('')
    const [ready, setReady] = useState(false)

    useEffect(() => {
        let stored = localStorage.getItem('visitorIdentity')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setVisitorId(parsed.visitorId || '')
                setVisitorName(parsed.visitorName || '')
                setVisitorPhone(parsed.visitorPhone || '')
            } catch (e) {}
        }
        setReady(true)
    }, [])

    const setVisitorInfo = (name, phone) => {
        let id = visitorId
        if (!id) {
            id = generateVisitorId()
            setVisitorId(id)
        }
        setVisitorName(name)
        setVisitorPhone(phone)
        localStorage.setItem('visitorIdentity', JSON.stringify({
            visitorId: id,
            visitorName: name,
            visitorPhone: phone,
        }))
    }

    const isIdentified = Boolean(visitorName && visitorPhone)

    return { visitorId, visitorName, visitorPhone, setVisitorInfo, isIdentified, ready }
}
