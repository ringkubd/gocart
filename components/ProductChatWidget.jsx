'use client'
import { useState, useEffect, useRef } from "react"
import { MessageCircleIcon, XIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useVisitorIdentity } from "./useVisitorIdentity"
import ChatWindow from "./ChatWindow"
import toast from "react-hot-toast"

export default function ProductChatWidget({ productId, storeId }) {
    const { data: session } = useSession()
    const { visitorId, visitorName, visitorPhone, setVisitorInfo, isIdentified, ready } = useVisitorIdentity()
    const [isOpen, setIsOpen] = useState(false)
    const [showInfoForm, setShowInfoForm] = useState(false)
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [unreadCount, setUnreadCount] = useState(0)

    const currentUserId = session?.user?.id || null
    const senderLabel = session?.user?.role === 'admin' ? 'admin' : 'user'

    // Listen for live messages when widget is open
    useEffect(() => {
        const handler = (e) => {
            const msg = e.detail
            if (ticket && msg) {
                setTicket(prev => {
                    if (!prev) return prev
                    const exists = prev.messages.some(m => m.id === msg.id)
                    if (exists) return prev
                    const updated = { ...prev, messages: [...prev.messages, { ...msg, sender: { name: msg.senderName, role: msg.senderRole } }] }
                    return updated
                })
                if (!isOpen) setUnreadCount(prev => prev + 1)
            }
        }
        window.addEventListener('chat-live-message', handler)
        return () => window.removeEventListener('chat-live-message', handler)
    }, [ticket?.id, isOpen])

    const openChat = async () => {
        if (!ready) return

        // Check if visitor needs to provide info
        if (!session && !isIdentified) {
            setShowInfoForm(true)
            setIsOpen(true)
            return
        }

        setIsOpen(true)
        setShowInfoForm(false)
        await loadOrCreateSession()
    }

    const loadOrCreateSession = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    visitorId: session ? undefined : visitorId,
                    visitorName: session ? undefined : visitorName,
                    visitorPhone: session ? undefined : visitorPhone,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setTicket(data.ticket)
                setUnreadCount(0)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleInfoSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim() || !phone.trim()) {
            toast.error('Name and phone are required')
            return
        }
        setVisitorInfo(name, phone)
        setShowInfoForm(false)
        setLoading(true)
        try {
            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    visitorId: visitorId || undefined,
                    visitorName: name,
                    visitorPhone: phone,
                }),
            })
            const data = await res.json()
            if (res.ok) setTicket(data.ticket)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (message) => {
        if (!ticket) return
        const res = await fetch('/api/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticketId: ticket.id,
                message,
                visitorId: session ? undefined : visitorId,
            }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')

        // Add message to local state (with dedup check)
        setTicket(prev => {
            const exists = prev.messages?.some(m => m.id === data.message.id)
            if (exists) return prev
            return { ...prev, messages: [...(prev.messages || []), data.message] }
        })
    }

    if (!ready) return null

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={openChat}
                    className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition"
                    aria-label="Chat about this product"
                >
                    <MessageCircleIcon size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{unreadCount}</span>
                    )}
                </button>
            )}

            {/* Chat popup */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)]">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" style={{ height: '500px' }}>
                        {showInfoForm ? (
                            <form onSubmit={handleInfoSubmit} className="flex flex-col h-full">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                                    <p className="text-sm font-medium text-slate-700">Start a conversation</p>
                                    <button type="button" onClick={() => { setIsOpen(false); setShowInfoForm(false) }} className="p-1 text-slate-400 hover:text-slate-600">
                                        <XIcon size={18} />
                                    </button>
                                </div>
                                <div className="flex-1 p-4 flex flex-col gap-3">
                                    <p className="text-xs text-slate-400">Please provide your details to start chatting</p>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name *"
                                        className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                                        required
                                    />
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Phone number *"
                                        className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                                        required
                                    />
                                    <button type="submit" className="bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                        Start Chat
                                    </button>
                                </div>
                            </form>
                        ) : loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-6 h-6 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <ChatWindow
                                ticket={ticket}
                                onSend={handleSend}
                                onClose={() => setIsOpen(false)}
                                currentUserId={currentUserId}
                                senderLabel={senderLabel}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
