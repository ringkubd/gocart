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
import { useSession } from "next-auth/react"

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

function buildInvoiceHtml(order, format) {
    const subtotal = order.orderItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0
    const discount = order.isCouponUsed ? (order.coupon?.discount / 100 * subtotal) : 0
    const date = new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    const statusColor = order.status === "DELIVERED" ? "#16a34a" : order.status === "CANCELLED" ? "#dc2626" : "#2563eb"

    const itemsHtml = order.orderItems?.map((item, i) => `
        <tr style="border-bottom:1px solid #e5e7eb">
            <td style="padding:10px 12px;color:#94a3b8">${i + 1}</td>
            <td style="padding:10px 12px">
                <div style="display:flex;align-items:center;gap:10px">
                    <img src="${item.product?.images?.[0] || '/assets/product_img1.png'}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;background:#f1f5f9" />
                    <span style="color:#334155;font-weight:500">${item.product?.name || 'Product'}</span>
                </div>
            </td>
            <td style="padding:10px 12px;text-align:center;color:#64748b">${item.quantity}</td>
            <td style="padding:10px 12px;text-align:right;color:#64748b">${format(item.price)}</td>
            <td style="padding:10px 12px;text-align:right;font-weight:600;color:#1e293b">${format(item.price * item.quantity)}</td>
        </tr>
    `).join('') || ''

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${order.orderNumber || order.id.slice(-8)}</title>
<style>
    @page { margin: 0.6cm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155; padding: 30px; }
    @media print { body { padding: 0; } }
</style></head><body>
<div style="max-width:700px;margin:0 auto">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #e2e8f0">
        <div>
            <h1 style="font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.5px">INVOICE</h1>
            <p style="font-size:13px;color:#94a3b8;margin-top:4px">theDhakaShop</p>
        </div>
        <div style="text-align:right">
            <p style="font-size:14px;font-weight:600;color:#334155;font-family:monospace">#${order.orderNumber || order.id.slice(-8)}</p>
            <p style="font-size:12px;color:#94a3b8;margin-top:4px">${date}</p>
            <span style="display:inline-block;margin-top:8px;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;background:${statusColor}15;color:${statusColor}">${order.status.replace(/_/g, ' ')}</span>
        </div>
    </div>

    <!-- From / To -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px">
        <div>
            <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">From</p>
            <p style="font-size:14px;font-weight:600;color:#1e293b">${order.store?.name || 'theDhakaShop'}</p>
            <p style="font-size:12px;color:#64748b;margin-top:2px">thedhakashop.com</p>
        </div>
        <div>
            <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Bill To</p>
            <p style="font-size:14px;font-weight:600;color:#1e293b">${order.guestName || order.user?.name || 'Customer'}</p>
            <p style="font-size:12px;color:#64748b;margin-top:2px">${order.address?.street || ''}</p>
            <p style="font-size:12px;color:#64748b">${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.zip || ''}</p>
            <p style="font-size:12px;color:#64748b">${order.address?.country || ''}</p>
            ${order.address?.phone ? `<p style="font-size:12px;color:#64748b;margin-top:4px">Phone: ${order.address.phone}</p>` : ''}
            ${(order.user?.email || order.guestEmail) ? `<p style="font-size:12px;color:#64748b">Email: ${order.user?.email || order.guestEmail}</p>` : ''}
        </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
        <thead>
            <tr style="border-bottom:2px solid #e2e8f0">
                <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">#</th>
                <th style="padding:8px 12px;text-align:left;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Item</th>
                <th style="padding:8px 12px;text-align:center;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
                <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Price</th>
                <th style="padding:8px 12px;text-align:right;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Total</th>
            </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
    </table>

    <!-- Summary -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:30px">
        <div style="width:260px">
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px">
                <span style="color:#94a3b8">Subtotal</span><span style="color:#64748b">${format(subtotal)}</span>
            </div>
            ${discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px">
                <span style="color:#94a3b8">Discount (${order.coupon?.code})</span><span style="color:#16a34a">-${format(discount)}</span>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px">
                <span style="color:#94a3b8">Shipping</span><span style="color:#64748b">${order.shippingCost > 0 ? format(order.shippingCost) : 'Free'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0 6px;font-size:15px;font-weight:700;border-top:2px solid #e2e8f0;color:#0f172a;margin-top:4px">
                <span>Total</span><span>${format(order.total)}</span>
            </div>
        </div>
    </div>

    <!-- Payment Info -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">
        <div>
            <p style="font-weight:700;color:#94a3b8;text-transform:uppercase;font-size:10px;letter-spacing:0.5px;margin-bottom:4px">Payment</p>
            <p>${order.paymentMethod} — ${order.isPaid ? 'Paid' : 'Pay on Delivery'}</p>
            ${order.transactionId ? `<p>Txn ID: ${order.transactionId}</p>` : ''}
        </div>
        <div style="text-align:right">
            ${order.shippingMethod ? `<p>Shipping: ${order.shippingMethod}</p>` : ''}
            ${order.courierName ? `<p>Courier: ${order.courierName}</p>` : ''}
            ${order.trackingNumber ? `<p>Tracking: ${order.trackingNumber}</p>` : ''}
        </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding-top:24px;margin-top:24px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8">
        <p>Thank you for your purchase!</p>
        <p style="margin-top:4px">thedhakashop.com | support@thedhakashop.com</p>
    </div>
</div>
</body></html>`
}

export default function OrderDetailPage({ params }) {
    const resolvedParams = use(params)
    const orderId = resolvedParams.orderId

    const { format } = useCurrency()
    const { t } = useLanguage()
    const { couriers } = useStorefrontData()
    const { data: session } = useSession()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [statusLoading, setStatusLoading] = useState(false)

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`)
            const data = await res.json()
            if (data.order) setOrder(data.order)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrder()
    }, [orderId])

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

    const updateStatus = async (newStatus) => {
        setStatusLoading(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
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

    const saveNotes = async () => {
        try {
            const noteEl = document.getElementById("admin-note")
            const custEl = document.getElementById("customer-note")
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    note: noteEl?.value,
                    customerNote: custEl?.value,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setOrder(data.order)
                toast.success("Notes saved")
            }
        } catch (error) {
            toast.error("Failed")
        }
    }

    const subtotal = order?.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    const discount = order?.isCouponUsed ? (order.coupon?.discount / 100 * subtotal) : 0

    const handlePrint = () => {
        if (!order) return
        const html = buildInvoiceHtml(order, format)
        const win = window.open('', '_blank', 'width=800,height=600')
        win.document.write(html)
        win.document.close()
        win.focus()
        setTimeout(() => win.print(), 500)
    }

    if (loading) return <Loading />
    if (!order) return <div className="p-10 text-center text-slate-400">Order not found.</div>

    return (
        <div className="max-w-7xl mx-auto text-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 no-print">
                <div>
                    <div className="text-sm text-slate-400 flex items-center gap-1 mb-1">
                        <Link href="/admin/orders" className="hover:underline">Orders</Link>
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

                    {/* Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="no-print">
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Order Notes (Internal)</label>
                            <textarea id="admin-note" defaultValue={order.note} className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 resize-none" placeholder="Add internal note about this order..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">Customer Note</label>
                            <textarea id="customer-note" defaultValue={order.customerNote} className="w-full border border-slate-200 rounded-lg p-3 text-sm h-24 resize-none bg-slate-50" placeholder="Note visible to customer..." />
                        </div>
                    </div>
                    <div className="mt-3 no-print">
                        <button onClick={saveNotes} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Note</button>
                    </div>
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
