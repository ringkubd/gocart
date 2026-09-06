'use client'
import { useRef, useEffect, useState } from "react"
import { SendIcon, XIcon } from "lucide-react"
import { useTicketChannel } from "@/components/useTicketChannel"

export default function ChatWindow({ ticket, onSend, onClose, currentUserId, senderLabel }) {
    const [reply, setReply] = useState("")
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)
    const { liveMessage, clearLiveMessage } = useTicketChannel(ticket?.id)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [ticket?.messages, liveMessage])

    // Append live messages
    useEffect(() => {
        if (liveMessage) {
            const evt = new CustomEvent('chat-live-message', { detail: liveMessage })
            window.dispatchEvent(evt)
            clearLiveMessage()
        }
    }, [liveMessage])

    const handleSend = async () => {
        if (!reply.trim() || sending) return
        setSending(true)
        try {
            await onSend(reply)
            setReply("")
        } catch (e) {}
        setSending(false)
    }

    if (!ticket) return null

    const msgs = ticket.messages || []

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white rounded-t-xl">
                <div className="flex items-center gap-3">
                    {ticket.product?.images?.[0] && (
                        <img src={ticket.product.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <div>
                        <p className="text-sm font-medium text-slate-700">{ticket.product?.name || ticket.subject}</p>
                        <p className="text-xs text-slate-400">
                            {ticket.user?.name || ticket.visitorName || 'Visitor'}
                            {ticket.visitorPhone && ` · ${ticket.visitorPhone}`}
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
                        <XIcon size={18} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[200px] max-h-[400px]">
                {msgs.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-8">No messages yet. Start the conversation!</p>
                )}
                {msgs.map((msg, i) => {
                    const isMe = msg.senderId === currentUserId || msg.senderRole === senderLabel
                    const isSeller = msg.senderRole === 'seller'
                    const isAdmin = msg.senderRole === 'admin'
                    return (
                        <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${
                                isMe ? 'bg-blue-600 text-white' :
                                isSeller ? 'bg-green-600 text-white' :
                                isAdmin ? 'bg-purple-600 text-white' :
                                'bg-white text-slate-700 border border-slate-200'
                            }`}>
                                {!isMe && (
                                    <p className="text-[10px] font-medium mb-0.5 opacity-70">
                                        {msg.sender?.name || msg.senderName || (isSeller ? 'Store' : isAdmin ? 'Admin' : 'Customer')}
                                    </p>
                                )}
                                <p className="text-sm">{msg.body}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? 'opacity-70' : 'text-slate-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            {ticket.status !== 'closed' && (
                <div className="flex gap-2 p-3 border-t border-slate-200 bg-white rounded-b-xl">
                    <input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                        placeholder="Type a message..."
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!reply.trim() || sending}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        <SendIcon size={18} />
                    </button>
                </div>
            )}
            {ticket.status === 'closed' && (
                <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl text-center text-sm text-slate-400">
                    This conversation has been closed.
                </div>
            )}
        </div>
    )
}
