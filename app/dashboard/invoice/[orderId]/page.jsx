'use client'
import Loading from "@/components/Loading"
import Image from "next/image"
import { use, useState, useEffect } from "react"
import { useCurrency } from "@/components/useCurrency"
import Link from "next/link"
import { ArrowLeftIcon, PrinterIcon } from "lucide-react"

export default function InvoicePage({ params }) {
    const resolvedParams = use(params)
    const orderId = resolvedParams.orderId

    const { format } = useCurrency()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`)
                const data = await res.json()
                if (data.order) setOrder(data.order)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [orderId])

    const subtotal = order?.orderItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
    const discount = order?.isCouponUsed ? (order.coupon?.discount / 100 * subtotal) : 0

    if (loading) return <Loading />
    if (!order) return <div className="p-10 text-center text-slate-400">Order not found.</div>

    return (
        <div className="max-w-3xl mx-auto text-slate-700 mb-20">
            <style>{`
                @media print {
                    @page { margin: 0.5cm; size: A4; }
                    body { margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
            <div className="flex items-center justify-between mb-6 no-print">
                <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
                    <ArrowLeftIcon size={16} /> Back to Orders
                </Link>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
                    <PrinterIcon size={16} /> Print Invoice
                </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-8 bg-white">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">INVOICE</h1>
                        <p className="text-sm text-slate-500 mt-1">theDhakaShop</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-slate-700">#{order.orderNumber || order.id.slice(-8)}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                        <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>

                {/* From / To */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">From</p>
                        <p className="text-sm font-medium text-slate-700">{order.store?.name || 'theDhakaShop'}</p>
                        <p className="text-xs text-slate-500 mt-1">thedhakashop.com</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Bill To</p>
                        <p className="text-sm font-medium text-slate-700">{order.guestName || order.user?.name || 'Customer'}</p>
                        <p className="text-xs text-slate-500 mt-1">{order.address?.street}</p>
                        <p className="text-xs text-slate-500">{order.address?.city}, {order.address?.state} {order.address?.zip}</p>
                        <p className="text-xs text-slate-500">{order.address?.country}</p>
                        {order.address?.phone && <p className="text-xs text-slate-500 mt-1">Phone: {order.address.phone}</p>}
                        {(order.user?.email || order.guestEmail) && <p className="text-xs text-slate-500">Email: {order.user?.email || order.guestEmail}</p>}
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-sm mb-6">
                    <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                            <th className="text-left py-2">Item</th>
                            <th className="text-center py-2 w-16">Qty</th>
                            <th className="text-right py-2 w-24">Price</th>
                            <th className="text-right py-2 w-24">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems?.map((item, i) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                            <Image src={item.product?.images?.[0] || '/assets/product_img1.png'} alt="" width={40} height={40} className="object-cover w-full h-full" />
                                        </div>
                                        <span className="text-slate-700">{item.product?.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                                <td className="py-3 text-right text-slate-600">{format(item.price)}</td>
                                <td className="py-3 text-right font-medium text-slate-700">{format(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Subtotal</span>
                            <span className="text-slate-600">{format(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-slate-400">Discount ({order.coupon?.code})</span>
                                <span className="text-green-600">-{format(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-slate-400">Shipping</span>
                            <span className="text-slate-600">{order.shippingCost > 0 ? format(order.shippingCost) : 'Free'}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold text-slate-800">
                            <span>Total</span>
                            <span>{format(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-500">
                    <div>
                        <p className="font-semibold text-slate-400 uppercase mb-1">Payment Method</p>
                        <p>{order.paymentMethod} — {order.isPaid ? 'Paid' : 'Pay on Delivery'}</p>
                        {order.transactionId && <p>Txn ID: {order.transactionId}</p>}
                    </div>
                    <div className="text-right">
                        {order.shippingMethod && <p>Shipping: {order.shippingMethod}</p>}
                        {order.courierName && <p>Courier: {order.courierName}</p>}
                        {order.trackingNumber && <p>Tracking: {order.trackingNumber}</p>}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                    <p>Thank you for your purchase!</p>
                    <p className="mt-1">thedhakashop.com | support@thedhakashop.com</p>
                </div>
            </div>
        </div>
    )
}
