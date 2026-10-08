'use client'
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PackageSearchIcon, TruckIcon, CheckCircle2Icon, ClockIcon } from "lucide-react"
import { useCurrency } from "@/components/useCurrency"
import { useOrderChannel } from "@/components/useOrderChannel"

const statusLabels = {
    ORDER_PLACED: "Order Placed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
}
const statusColors = {
    ORDER_PLACED: "bg-yellow-100 text-yellow-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
}

export default function TrackOrderPage() {
    const { format } = useCurrency()
    const [orderNumber, setOrderNumber] = useState("")
    const [contact, setContact] = useState("")
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const pollRef = useRef(null)

    const live = useOrderChannel(order?.id)

    const fetchOrder = async (showSpinner = false) => {
        if (showSpinner) setLoading(true)
        try {
            const res = await fetch(`/api/track-order?orderNumber=${encodeURIComponent(orderNumber)}&contact=${encodeURIComponent(contact)}`)
            const data = await res.json()
            if (res.ok) { setOrder(data.order); setError("") }
            else { setError(data.error || "Order not found"); setOrder(null) }
        } catch (e) {
            setError("Failed to fetch order")
        } finally {
            if (showSpinner) setLoading(false)
        }
    }

    const onSubmit = (e) => {
        e.preventDefault()
        fetchOrder(true)
    }

    // Auto-refresh while an order is shown
    useEffect(() => {
        if (!order) return
        pollRef.current = setInterval(() => fetchOrder(false), 15000)
        return () => clearInterval(pollRef.current)
    }, [order?.id, orderNumber, contact])

    // Instant refresh on live websocket event
    useEffect(() => {
        if (live && order) fetchOrder(false)
    }, [live])

    return (
        <div className="min-h-[70vh] mx-6 my-10">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <PackageSearchIcon size={40} className="mx-auto text-green-600 mb-3" />
                    <h1 className="text-3xl font-semibold text-slate-800">Track Your Order</h1>
                    <p className="text-slate-500 text-sm mt-2">Enter your order number and the phone or email used at checkout.</p>
                </div>

                <form onSubmit={onSubmit} className="border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-3">
                    <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Order number (e.g. 2026-000001)" className="border border-slate-200 rounded p-2.5 text-sm flex-1" required />
                    <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" className="border border-slate-200 rounded p-2.5 text-sm flex-1" required />
                    <button disabled={loading} className="bg-slate-800 text-white px-6 py-2.5 rounded text-sm hover:bg-slate-900 disabled:opacity-50">{loading ? "..." : "Track"}</button>
                </form>
                {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

                {order && (
                    <div className="mt-8 border border-slate-200 rounded-xl p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div>
                                <p className="text-xs text-slate-400">Order</p>
                                <p className="font-mono text-sm text-slate-700">{order.orderNumber || order.id.slice(-8)}</p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Payment: {order.isPaid ? "Paid" : "Unpaid"}</span>
                            {order.courierName && <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex items-center gap-1"><TruckIcon size={12} /> {order.courierName}</span>}
                            {order.trackingNumber && <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Tracking: {order.trackingNumber}</span>}
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Total: {format(order.total)}</span>
                        </div>

                        {/* Items */}
                        <div className="mt-5 flex flex-col gap-3">
                            {(order.orderItems || []).map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Image width={40} height={40} className="rounded bg-slate-100 p-1" src={item.product?.images?.[0] || "/assets/product_img1.png"} alt="" />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700">{item.product?.name}</p>
                                        <p className="text-xs text-slate-400">Qty: {item.quantity} · {format(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Status timeline */}
                        <div className="mt-6 pt-5 border-t border-slate-100">
                            <h3 className="text-sm font-medium text-slate-700 mb-4">Status History</h3>
                            <div className="flex flex-col gap-3">
                                {[...(order.statusLogs || [])].reverse().map((log, i) => (
                                    <div key={log.id || i} className="flex gap-3">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${statusColors[log.status] || "bg-slate-100 text-slate-500"}`}>
                                            {log.status === "DELIVERED" ? <CheckCircle2Icon size={14} /> : <ClockIcon size={14} />}
                                        </div>
                                        <div className="flex-1 border-b border-slate-50 pb-2">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-sm font-medium text-slate-700">{statusLabels[log.status] || log.status}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{log.description}</p>
                                            {log.courierNote && <p className="text-xs text-slate-400">{log.courierNote}</p>}
                                        </div>
                                    </div>
                                ))}
                                {(order.statusLogs || []).length === 0 && <p className="text-xs text-slate-400">No status updates yet.</p>}
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-4">This page auto-updates. <Link href="/support" className="text-green-600 hover:underline">Need help?</Link></p>
                    </div>
                )}
            </div>
        </div>
    )
}
