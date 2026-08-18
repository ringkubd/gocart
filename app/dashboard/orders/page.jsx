'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PackageIcon, FileTextIcon } from "lucide-react"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

const statusColors = {
    ORDER_PLACED: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

export default function DashboardOrders() {

    const { format } = useCurrency()
    const { t } = useLanguage()

    const statusLabels = {
        ORDER_PLACED: t('orderPlaced'),
        PROCESSING: t('processing'),
        SHIPPED: t('shipped'),
        DELIVERED: t('delivered'),
        CANCELLED: t('cancelled'),
    }

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders')
            const data = await res.json()
            if (res.ok) setOrders(data.orders)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div>
            <h1 className="text-2xl text-slate-700 font-medium mb-6">{t('myOrders')}</h1>
            {orders.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <PackageIcon size={48} className="mx-auto mb-4 opacity-40" />
                    <p>{t('youHaveNoOrders')}.</p>
                    <Link href="/shop" className="inline-block mt-4 bg-slate-800 text-white px-6 py-2 rounded text-sm hover:bg-slate-900">{t('startShopping')}</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-slate-200 rounded-xl p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-xs text-slate-400 font-mono">Order {order.orderNumber || order.id.slice(-8)}</p>
                                    <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {order.trackingNumber && (
                                        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                            {order.courierName} · {order.trackingNumber}
                                        </span>
                                    )}
                                    <span className={`text-xs px-3 py-1 rounded-full ${statusColors[order.status]}`}>{statusLabels[order.status]}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {order.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Image width={50} height={50} className="rounded bg-slate-100 p-1" src={item.product?.images?.[0] || '/assets/product_img1.png'} alt="" />
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700">{item.product?.name}</p>
                                            <p className="text-xs text-slate-400">Qty: {item.quantity} · {format(item.price)} each</p>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">{format(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-slate-100 text-sm">
                                <div className="text-xs text-slate-400">
                                    {order.shippingMethod && <span className="mr-3">{order.shippingMethod}</span>}
                                    <span>{order.paymentMethod} · {order.isPaid ? 'Paid' : 'Pay on delivery'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={`/dashboard/invoice/${order.id}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50">
                                        <FileTextIcon size={14} /> Invoice
                                    </Link>
                                    <span className="font-medium text-slate-700">
                                        Total: <span className="text-lg">{format(order.total)}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
