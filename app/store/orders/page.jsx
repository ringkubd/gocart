'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"
import GuestBadge from "@/components/GuestBadge"
import { useRouter } from "next/navigation"

const statusColors = {
    ORDER_PLACED: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

const statusLabels = {
    ORDER_PLACED: 'Order Placed', PROCESSING: 'Processing', SHIPPED: 'Shipped',
    DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
}

export default function StoreOrders() {
    const router = useRouter()
    const { format } = useCurrency()
    const { t } = useLanguage()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/store/orders')
            const data = await res.json()
            if (res.ok) setOrders(data.orders)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchOrders() }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl mb-5">{t('orderManagement')}</h1>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="overflow-x-auto max-w-5xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                {["Sr. No.", "Customer", "Total", "Payment", "Coupon", "Status", "Date"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr key={order.id} onClick={() => router.push('/store/orders/' + order.id)} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                                    <td className="pl-6 text-green-600">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span>{order.guestName || order.user?.name || 'Guest'}</span>
                                            <GuestBadge order={order} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{format(order.total)}</td>
                                    <td className="px-4 py-3">{order.paymentMethod}{order.isPaid ? '' : ' (COD)'}</td>
                                    <td className="px-4 py-3">{order.isCouponUsed ? <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{order.coupon?.code}</span> : "—"}</td>
                                    <td className="px-4 py-3"><span className={`text-xs px-3 py-1 rounded-full ${statusColors[order.status]}`}>{statusLabels[order.status]}</span></td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
