'use client'
import Loading from "@/components/Loading"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { MessageCircleIcon, ArrowLeftIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import ChatWindow from "@/components/ChatWindow"
import { useCurrency } from "@/components/useCurrency"

export default function StoreChats() {
    const { data: session } = useSession()
    const { format } = useCurrency()

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [filter, setFilter] = useState('')

    const fetchTickets = async (status = filter) => {
        try {
            const params = new URLSearchParams()
            if (status) params.set('status', status)
            const res = await fetch(`/api/chat/store?${params.toString()}`)
            const data = await res.json()
            if (res.ok) setTickets(data.tickets)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const openTicket = async (ticket) => {
        try {
            const res = await fetch(`/api/support/${ticket.id}`)
            const data = await res.json()
            if (res.ok) {
                setSelected(data.ticket)
                // Mark as read
                await fetch('/api/chat/read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticketId: ticket.id }),
                })
                fetchTickets(filter)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const sendReply = async (message) => {
        if (!selected) return
        const res = await fetch('/api/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId: selected.id, message }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed')
        setSelected(prev => {
            const exists = prev.messages?.some(m => m.id === data.message.id)
            if (exists) return prev
            return { ...prev, messages: [...(prev.messages || []), data.message] }
        })
        fetchTickets(filter)
    }

    const updateStatus = async (ticketId, status) => {
        try {
            const res = await fetch(`/api/support/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (res.ok) {
                toast.success('Status updated')
                if (selected?.id === ticketId) setSelected(prev => ({ ...prev, status }))
                fetchTickets(filter)
            }
        } catch (error) {
            toast.error('Failed')
        }
    }

    useEffect(() => { fetchTickets() }, [filter])

    // Listen for live messages
    useEffect(() => {
        const handler = (e) => {
            const msg = e.detail
            if (selected && msg) {
                setSelected(prev => {
                    if (!prev) return prev
                    const exists = prev.messages?.some(m => m.id === msg.id)
                    if (exists) return prev
                    return { ...prev, messages: [...(prev.messages || []), { ...msg, sender: { name: msg.senderName, role: msg.senderRole } }] }
                })
            }
        }
        window.addEventListener('chat-live-message', handler)
        return () => window.removeEventListener('chat-live-message', handler)
    }, [selected?.id])

    if (loading) return <Loading />

    return (
        <div className="text-slate-700 mb-20">
            <h1 className="text-2xl mb-5">Product Chats</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Chat list */}
                <div className="w-full lg:w-80 shrink-0">
                    {/* Filter */}
                    <div className="flex gap-2 mb-4">
                        {['', 'open', 'in_progress', 'closed'].map(s => (
                            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-xs border ${filter === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                {s || 'All'}
                            </button>
                        ))}
                    </div>

                    {/* Ticket list */}
                    <div className="space-y-2">
                        {tickets.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-8">No product chats yet.</p>
                        )}
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => openTicket(ticket)}
                                className={`border rounded-xl p-3 cursor-pointer transition hover:bg-slate-50 ${selected?.id === ticket.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                            >
                                <div className="flex items-start gap-3">
                                    {ticket.product?.images?.[0] && (
                                        <img src={ticket.product.images[0]} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{ticket.product?.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{ticket.user?.name || ticket.visitorName || 'Visitor'}</p>
                                        {ticket.messages?.[0] && (
                                            <p className="text-xs text-slate-400 truncate mt-1">{ticket.messages[0].body}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {ticket.unreadCount > 0 && (
                                            <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{ticket.unreadCount}</span>
                                        )}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : ticket.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat area */}
                <div className="flex-1">
                    {selected ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            {/* Status buttons */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                                <span className="text-xs text-slate-400">Status:</span>
                                {['open', 'in_progress', 'closed'].map(s => (
                                    <button key={s} onClick={() => updateStatus(selected.id, s)} className={`px-3 py-1 rounded-full text-xs border ${selected.status === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div style={{ height: '500px' }}>
                                <ChatWindow
                                    ticket={selected}
                                    onSend={sendReply}
                                    currentUserId={session?.user?.id}
                                    senderLabel="seller"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-slate-200 rounded-xl text-slate-400">
                            <MessageCircleIcon size={40} className="mb-3 opacity-40" />
                            <p className="text-sm">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
