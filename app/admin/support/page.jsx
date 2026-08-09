'use client'
import Loading from "@/components/Loading"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { SendIcon, ArrowLeftIcon } from "lucide-react"
import { useTicketChannel } from "@/components/useTicketChannel"

export default function AdminSupport() {

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [selected, setSelected] = useState(null)
    const [reply, setReply] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)

    const { liveMessage, clearLiveMessage } = useTicketChannel(selected?.id)

    const fetchTickets = async (status = filter) => {
        try {
            const params = new URLSearchParams()
            if (status) params.set('status', status)
            const res = await fetch(`/api/admin/support?${params.toString()}`)
            const data = await res.json()
            if (res.ok) setTickets(data.tickets)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const openTicket = async (ticketId) => {
        try {
            const res = await fetch(`/api/support/${ticketId}`)
            const data = await res.json()
            if (res.ok) {
                setSelected(data.ticket)
                clearLiveMessage()
            }
        } catch (error) {
            console.error(error)
        }
    }

    const sendReply = async () => {
        if (!reply.trim() || sending) return
        setSending(true)
        try {
            const res = await fetch(`/api/support/${selected.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send')
            setReply('')
            setSelected(prev => ({
                ...prev,
                messages: [...prev.messages, data.message],
            }))
            fetchTickets(filter)
        } catch (error) {
            toast.error(error.message || 'Failed')
        } finally {
            setSending(false)
        }
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

    // Append live messages
    useEffect(() => {
        if (liveMessage) {
            setSelected(prev => {
                if (!prev) return prev
                const exists = prev.messages.some(m => m.id === liveMessage.id)
                if (exists) return prev
                return { ...prev, messages: [...prev.messages, liveMessage] }
            })
            clearLiveMessage()
        }
    }, [liveMessage])

    useEffect(() => {
        fetchTickets()
    }, [filter])

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }, [selected?.messages?.length])

    if (loading) return <Loading />

    const statusBadge = (s) => {
        const map = {
            open: 'bg-green-100 text-green-700',
            in_progress: 'bg-blue-100 text-blue-700',
            closed: 'bg-slate-100 text-slate-500',
        }
        return `text-xs px-3 py-1 rounded-full ${map[s] || map.open}`
    }

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">Support <span className="text-slate-800 font-medium">Tickets</span></h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-5">
                <button onClick={() => setFilter('')} className={`px-4 py-1.5 rounded-full text-sm border ${filter === '' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}>All</button>
                {['open', 'in_progress', 'closed'].map((s) => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm border ${filter === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}>{s.replace('_', ' ')}</button>
                ))}
            </div>

            {selected ? (
                <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden max-w-3xl">
                    {/* Header */}
                    <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelected(null)} className="hover:opacity-70"><ArrowLeftIcon size={18} /></button>
                            <div>
                                <p className="font-medium text-sm">{selected.subject}</p>
                                <p className="text-xs opacity-80">{selected.user?.name} · {selected.user?.email} · #{selected.id.slice(-8)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={statusBadge(selected.status)}>{selected.status.replace('_', ' ')}</span>
                            {selected.status !== 'closed' && (
                                <button onClick={() => updateStatus(selected.id, 'closed')} className="text-xs bg-white/20 px-3 py-1.5 rounded hover:bg-white/30">Close</button>
                            )}
                            {selected.status === 'open' && (
                                <button onClick={() => updateStatus(selected.id, 'in_progress')} className="text-xs bg-white/20 px-3 py-1.5 rounded hover:bg-white/30">In Progress</button>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="p-4 bg-slate-50 h-96 overflow-y-auto flex flex-col gap-3">
                        {selected.messages.map((m, i) => (
                            <div key={m.id || i} className={`max-w-[80%] flex flex-col ${m.senderRole === 'admin' ? 'self-end items-end' : 'self-start items-start'}`}>
                                <div className={`rounded-2xl px-4 py-2 text-sm ${m.senderRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                                    {m.body}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-slate-400">{m.sender?.name || 'Customer'}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Reply */}
                    <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                        <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} disabled={selected.status === 'closed'} placeholder={selected.status === 'closed' ? 'Ticket closed' : 'Reply as admin...'} className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none disabled:bg-slate-50" />
                        <button onClick={sendReply} disabled={sending || selected.status === 'closed'} className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-40"><SendIcon size={16} /></button>
                    </div>
                </div>
            ) : (
                <div className="mt-6 flex flex-col gap-3 max-w-3xl">
                    {tickets.length ? tickets.map((ticket) => (
                        <button key={ticket.id} onClick={() => openTicket(ticket.id)} className="border border-slate-200 rounded-xl p-5 text-left hover:border-slate-300 hover:bg-slate-50 transition">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium text-slate-700">{ticket.subject}</p>
                                    <p className="text-xs text-slate-400 mt-1">{ticket.user?.name} · {ticket.user?.email} · {ticket._count?.messages} msgs</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">Priority: {ticket.priority}</span>
                                    <span className={statusBadge(ticket.status)}>{ticket.status.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </button>
                    )) : (
                        <p className="text-sm text-slate-400">No tickets found.</p>
                    )}
                </div>
            )}
        </div>
    )
}
