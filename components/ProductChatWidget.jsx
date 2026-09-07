'use client'
import { useState, useEffect } from "react"
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

    const currentUserId = session?.user?.id || null
    const senderLabel = session?.user?.role === 'admin' ? 'admin' : 'user'

    // Listen for live messages when widget is open
    useEffect(() => {
        const handler = (e) => {
            const msg = e.detail
            if (ticket && msg) {
                setTicket(prev => {
                    if (!prev) return prev
                    const exists = prev.messages?.some(m => m.id === msg.id)
                    if (exists) return prev
                    return { ...prev, messages: [...(prev.messages || []), { ...msg, sender: { name: msg.senderName, role: msg.senderRole } }] }
                })
            }
        }
        window.addEventListener('chat-live-message', handler)
        return () => window.removeEventListener('chat-live-message', handler)
    }, [ticket?.id])

    const openChat = async () => {
        if (!ready) return
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
            if (res.ok) setTicket(data.ticket)
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
            // Get visitorId from localStorage (setVisitorInfo writes there)
            let vid = visitorId
            if (!vid) {
                try {
                    const stored = JSON.parse(localStorage.getItem('visitorIdentity') || '{}')
                    vid = stored.visitorId
                } catch (e) {}
            }
            const res = await fetch('/api/chat/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    visitorId: vid || undefined,
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

        setTicket(prev => {
            const exists = prev.messages?.some(m => m.id === data.message.id)
            if (exists) return prev
            return { ...prev, messages: [...(prev.messages || []), data.message] }
        })
    }

    if (!ready) return null

    return (
        <>
            {/* Inline button */}
            {!isOpen && (
                <button
                    onClick={openChat}
                    className="flex items-center gap-1.5 bg-[#00B2FF] text-white px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-[#009add] active:scale-95 transition whitespace-nowrap"
                    aria-label="Chat about this product"
                >
                    <MessageCircleIcon size={14} />
                    Chat
                </button>
            )}

            {/* Chat popup - fixed bottom-right */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)]">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" style={{ height: '450px' }}>
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
