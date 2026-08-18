'use client'
import Loading from "@/components/Loading"
import Image from "next/image"
import { use, useState, useEffect } from "react"
import toast from "react-hot-toast"
import Link from "next/link"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"
import GuestBadge from "@/components/GuestBadge"
import useStorefrontData from "@/components/useStorefrontData"

const statusLabels = {
    ORDER_PLACED: "Order Placed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
}

const statusDescriptions = {
    ORDER_PLACED: "Order has been placed successfully.",
    PROCESSING: "Order is being processed.",
    SHIPPED: "Order has been shipped from the warehouse.",
    DELIVERED: "Order has been delivered to the customer.",
    CANCELLED: "Order has been cancelled.",
}

const statusColors = {
    ORDER_PLACED: "bg-slate-100 text-slate-600",
    PROCESSING: "bg-orange-100 text-orange-600",
    SHIPPED: "bg-purple-100 text-purple-600",
    DELIVERED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-600",
}

const statusIcons = {
    ORDER_PLACED: "bg-slate-100 text-slate-500",
    PROCESSING: "bg-orange-100 text-orange-500",
    SHIPPED: "bg-purple-100 text-purple-500",
    DELIVERED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-500",
}

export default function StoreOrderDetailPage({ params }) {
    const resolvedParams = use(params)
    const orderId = resolvedParams.orderId

    const { format } = useCurrency()
    const { t } = useLanguage()
    const { couriers } = useStorefrontData()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [statusLoading, setStatusLoading] = useState(false)

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/store/orders/${orderId}`)
            const data = await res.json()
            if (data.order) setOrder(data.order)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrder() }, [orderId])

    const statusLogs = (() => {
        if (order?.statusLogs?.length > 0) return order.statusLogs
        if (!order) return []
        const logs = []
        logs.push({ status: "ORDER_PLACED", description: "Order has been placed successfully.", createdAt: order.createdAt })
        if (order.isPaid) {
            logs.push({ status: "ORDER_PLACED", description: "Payment has been confirmed.", createdAt: order.createdAt, courierNote: `Payment Method: ${order.paymentMethod}${order.transactionId ? ` (Txn: ${order.transactionId})` : ''}` })
        }
        if (order.shippedAt) logs.push({ status: "SHIPPED", description: "Order has been shipped.", createdAt: order.shippedAt, courierName: order.courierName || "" })
        if (order.deliveredAt) logs.push({ status: "DELIVERED", description: "Order has been delivered to the customer.", createdAt: order.deliveredAt, courierName: order.courierName || "" })
        if (order.cancelledAt) logs.push({ status: "CANCELLED", description: "Order has been cancelled.", createdAt: order.cancelledAt })
        return logs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    })()

    const saveTracking = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/store/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courierName: document.getElementById("courier-name").value,
                    trackingNumber: document.getElementById("tracking-number").value,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setOrder(data.order)
                toast.success("Tracking info saved")
            } else {
                toast.error(data.error || "Failed")
            }
        } catch (error) {
            toast.error("Failed")
        } finally {
            setSaving(false)
        }
    }

    const updateStatus = async (newStatus) => {
        setStatusLoading(true)
        try {
            const res = await fetch(`/api/store/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })
            const data = await res.json()
            if (res.ok) {
                setOrder(data.order)
                toast.success("Status updated")
            } else {
                toast.error(data.error || "Failed")
            }
        } catch (error) {
            toast.error("Failed")
        } finally {
            setStatusLoading(false)
        }
    }

    const subtotal = order?.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    const discount = order?.isCouponUsed ? (order.coupon?.discount / 100 * subtotal) : 0

    const handlePrint = () => { window.print() }

    if (loading) return <Loading />
    if (!order) return <div className="p-10 text-center text-slate-400">Order not found.</div>

    return (
        <div className="max-w-7xl mx-auto text-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 no-print">
                <div>
                    <div className="text-sm text-slate-400 flex items-center gap-1 mb-1">
                        <Link href="/store/orders" className="hover:underline">Orders</Link>
                        <span className="mx-1">&rsaquo;</span>
                        <span>Order Details</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2">
                        Print Invoice
                    </button>
                    <select
                        value={order.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        disabled={statusLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        <option value="ORDER_PLACED">Order Placed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Main content */}
                <div className="flex-1">
                    {/* Order header */}
                    <div className="border border-slate-200 rounded-xl p-6 mb-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h1 className="text-2xl font-semibold text-slate-800">Order {order.orderNumber || '#' + order.id.slice(-8)}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                            <GuestBadge order={order} />
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span>Placed on: <strong>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong></span>
                            <span>Payment: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.isPaid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{order.isPaid ? "Paid" : "Unpaid"}</span></span>
                        </div>
                    </div>

                    {/* Info cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="border border-slate-200 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Customer</p>
                            <p className="text-sm font-medium text-slate-700">{order.guestName || order.user?.name || "Guest"}</p>
                            <p className="text-xs text-slate-500">{order.guestPhone || order.user?.email || order.guestEmail}</p>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Delivery Address</p>
                            <p className="text-sm text-slate-600">{order.address?.street}, {order.address?.city}, {order.address?.state} {order.address?.zip}</p>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Payment Method</p>
                            <p className="text-sm font-medium text-slate-700">{order.paymentMethod}</p>
                            {order.transactionId && <p className="text-xs text-slate-500">Txn ID: {order.transactionId}</p>}
                        </div>
                        <div className="border border-slate-200 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                            <p className="text-lg font-semibold text-slate-800">{format(order.total)}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                        <h3 className="p-4 font-medium text-slate-700 border-b border-slate-200 bg-slate-50">Order Items</h3>
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr className="text-xs text-slate-500 uppercase">
                                    <th className="px-4 py-2 text-left w-10">SL</th>
                                    <th className="px-4 py-2 text-left">ITEM</th>
                                    <th className="px-4 py-2 text-center">QTY</th>
                                    <th className="px-4 py-2 text-right">UNIT PRICE</th>
                                    <th className="px-4 py-2 text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderItems?.map((item, index) => (
                                    <tr key={item.orderId + item.productId} className="border-b border-slate-100 last:border-b-0">
                                        <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                                    <Image src={item.product?.images?.[0] || "/assets/product_img1.png"} alt="" width={40} height={40} className="object-cover w-full h-full" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-700">{item.product?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">{format(item.price)}</td>
                                        <td className="px-4 py-3 text-right font-medium">{format(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary */}
                    <div className="border border-slate-200 rounded-xl p-5 mb-6 max-w-sm ml-auto">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>{format(subtotal)}</span></div>
                            {discount > 0 && <div className="flex justify-between"><span className="text-slate-400">Discount</span><span className="text-green-600">-{format(discount)}</span></div>}
                            <div className="flex justify-between"><span className="text-slate-400">Delivery Charge</span><span>{format(order.shippingCost)}</span></div>
                            <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold text-slate-800"><span>Grand Total</span><span>{format(order.total)}</span></div>
                        </div>
                    </div>

                    {/* Delivery Tracking */}
                    <div className="border border-slate-200 rounded-xl p-5 mb-6">
                        <h3 className="font-medium text-slate-700 mb-4">Delivery Tracking</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Courier Name</span>
                                <select defaultValue={order.courierName} id="courier-name" className="border border-slate-200 rounded-lg p-2.5 text-sm">
                                    <option value="">Select courier</option>
                                    {(couriers || []).map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                                    {order.courierName && !(couriers || []).some(c => c.name === order.courierName) && (
                                        <option value={order.courierName}>{order.courierName}</option>
                                    )}
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Tracking Number</span>
                                <input defaultValue={order.trackingNumber} id="tracking-number" className="border border-slate-200 rounded-lg p-2.5 text-sm" placeholder="Enter tracking number" />
                            </label>
                        </div>
                        <button onClick={saveTracking} disabled={saving} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {saving ? "Saving..." : "Save Tracking Info"}
                        </button>
                    </div>

                    {/* Customer Note */}
                    {order.customerNote && (
                        <div className="border border-slate-200 rounded-xl p-5 mb-6">
                            <h3 className="font-medium text-slate-700 mb-2">Customer Note</h3>
                            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{order.customerNote}</p>
                        </div>
                    )}
                </div>

                {/* Right: Status History Timeline */}
                <div className="w-full lg:w-80 shrink-0">
                    <h3 className="font-medium text-slate-700 mb-4">Order Status History</h3>
                    <div className="relative">
                        {statusLogs.length > 1 && (
                            <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-slate-200" />
                        )}
                        <div className="flex flex-col gap-4">
                            {statusLogs.slice().reverse().map((log, index) => (
                                <div key={log.id || index} className="relative flex gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${statusIcons[log.status] || "bg-slate-100 text-slate-500"}`}>
                                        <span className="text-sm">
                                            {log.status === "DELIVERED" && "✓"}
                                            {log.status === "PROCESSING" && "📦"}
                                            {log.status === "SHIPPED" && "🚚"}
                                            {log.status === "ORDER_PLACED" && "⏰"}
                                            {log.status === "CANCELLED" && "✗"}
                                        </span>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-semibold ${statusColors[log.status]?.replace("bg-", "text-") || "text-slate-600"}`}>{statusLabels[log.status] || log.status}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">{log.description || statusDescriptions[log.status] || ""}</p>
                                        {log.courierName && (
                                            <p className="text-xs text-slate-400 mt-1">
                                                <span className="font-medium">Courier:</span> <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[11px]">{log.courierName}</span>
                                            </p>
                                        )}
                                        {log.courierNote && (
                                            <p className="text-xs text-slate-400 mt-1">{log.courierNote}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {statusLogs.length === 0 && (
                            <p className="text-xs text-slate-400 text-center mt-4">No status updates yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
