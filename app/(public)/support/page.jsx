'use client'
import Loading from "@/components/Loading"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { PlusIcon, ArrowLeftIcon, SendIcon, HeadphonesIcon } from "lucide-react"
import { useTicketChannel } from "@/components/useTicketChannel"

export default function Support() {

    const { status } = useSession()
    const router = useRouter()

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [showNew, setShowNew] = useState(false)
    const [newForm, setNewForm] = useState({ subject: '', message: '', priority: 'normal' })
    const [reply, setReply] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)

    const { liveMessage, clearLiveMessage } = useTicketChannel(selected?.id)

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/support')
            const data = await res.json()
            if (res.ok) {
                setTickets(data.tickets)
            }
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

    const createTicket = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newForm),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create ticket')
            toast.success('Ticket created')
            setShowNew(false)
            setNewForm({ subject: '', message: '', priority: 'normal' })
            fetchTickets()
        } catch (error) {
            toast.error(error.message || 'Failed')
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
        } catch (error) {
            toast.error(error.message || 'Failed')
        } finally {
            setSending(false)
        }
    }

    const closeTicket = async () => {
        try {
            const res = await fetch(`/api/support/${selected.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'closed' }),
            })
            if (res.ok) {
                toast.success('Ticket closed')
                setSelected(prev => ({ ...prev, status: 'closed' }))
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
                return {
                    ...prev,
                    messages: [...prev.messages, liveMessage],
                    status: prev.status === 'closed' ? 'open' : prev.status,
                }
            })
            clearLiveMessage()
        }
    }, [liveMessage])

    useEffect(() => {
        if (status === 'authenticated') fetchTickets()
        else if (status === 'unauthenticated') router.push('/login')
    }, [status])

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [selected?.messages?.length])

    if (status === 'loading' || loading) return <Loading />

    const statusBadge = (s) => {
        const map = {
            open: 'bg-green-100 text-green-700',
            in_progress: 'bg-blue-100 text-blue-700',
            closed: 'bg-slate-100 text-slate-500',
        }
        return `text-xs px-3 py-1 rounded-full ${map[s] || map.open}`
    }

    return (
        <div className="min-h-[70vh] mx-6 my-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl">Support <span className="text-slate-800 font-medium">Center</span></h1>
                    <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900">
                        <PlusIcon size={16} /> {showNew ? 'Cancel' : 'New Ticket'}
                    </button>
                </div>

                {showNew && (
                    <form onSubmit={createTicket} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-xl flex flex-col gap-4 bg-slate-50/50">
                        <h3 className="font-medium text-slate-700">Create a Support Ticket</h3>
                        <input value={newForm.subject} onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })} placeholder="Subject" className="border border-slate-200 rounded p-2 text-sm" required />
                        <textarea value={newForm.message} onChange={(e) => setNewForm({ ...newForm, message: e.target.value })} rows={4} placeholder="Describe your issue or question..." className="border border-slate-200 rounded p-2 text-sm resize-none" required />
                        <select value={newForm.priority} onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })} className="border border-slate-200 rounded p-2 text-sm">
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                        <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Submit Ticket</button>
                    </form>
                )}

                {/* Chat / list */}
                {selected ? (
                    <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden max-w-3xl">
                        {/* Header */}
                        <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelected(null)} className="hover:opacity-70"><ArrowLeftIcon size={18} /></button>
                                <div>
                                    <p className="font-medium text-sm">{selected.subject}</p>
                                    <p className="text-xs opacity-80">Ticket #{selected.id.slice(-8)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={statusBadge(selected.status).replace('text-white', '')}>{selected.status.replace('_', ' ')}</span>
                                {selected.status !== 'closed' && (
                                    <button onClick={closeTicket} className="text-xs bg-white/20 px-3 py-1.5 rounded hover:bg-white/30">Close</button>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="p-4 bg-slate-50 h-96 overflow-y-auto flex flex-col gap-3">
                            {selected.messages.map((m, i) => (
                                <div key={m.id || i} className={`max-w-[80%] flex flex-col ${m.senderRole === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <div className={`rounded-2xl px-4 py-2 text-sm ${m.senderRole === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                                        {m.body}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-400">{m.sender?.name || 'You'}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Reply */}
                        <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
                            <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} disabled={selected.status === 'closed'} placeholder={selected.status === 'closed' ? 'This ticket is closed' : 'Type a reply...'} className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none disabled:bg-slate-50" />
                            <button onClick={sendReply} disabled={sending || selected.status === 'closed'} className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 disabled:opacity-40"><SendIcon size={16} /></button>
                        </div>
                    </div>
                ) : tickets.length > 0 ? (
                    <div className="mt-6 flex flex-col gap-3 max-w-3xl">
                        {tickets.map((ticket) => (
                            <button key={ticket.id} onClick={() => openTicket(ticket.id)} className="border border-slate-200 rounded-xl p-5 text-left hover:border-slate-300 hover:bg-slate-50 transition">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-slate-700">{ticket.subject}</p>
                                        <p className="text-xs text-slate-400 mt-1">{ticket.messages.length} messages · last activity {new Date(ticket.updatedAt).toLocaleString()}</p>
                                    </div>
                                    <span className={statusBadge(ticket.status)}>{ticket.status.replace('_', ' ')}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 text-center text-slate-400 py-16 border border-dashed border-slate-200 rounded-xl">
                        <HeadphonesIcon size={40} className="mx-auto mb-3 opacity-40" />
                        <p>No support tickets yet. Create a ticket to get help.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
