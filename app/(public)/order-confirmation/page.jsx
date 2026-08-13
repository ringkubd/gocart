'use client'
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircleIcon, PackageIcon } from "lucide-react"
import Loading from "@/components/Loading"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

function ConfirmationContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id") || ""
    const email = searchParams.get("email") || ""

    const { format } = useCurrency()
    const { t } = useLanguage()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id || !email) {
                setError("Order ID or email missing")
                setLoading(false)
                return
            }
            try {
                const res = await fetch(`/api/orders/guest?id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`)
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || "Order not found")
                setOrder(data.order)
            } catch (err) {
                setError(err.message || "Order not found")
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id, email])

    if (loading) return <Loading />

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 text-slate-400">
                <PackageIcon size={48} className="mb-4 opacity-40" />
                <h1 className="text-2xl font-semibold">{t('orderNotFound')}</h1>
                <p className="mt-2 text-sm">{error}</p>
                <Link href="/" className="bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm mt-6 hover:bg-slate-900">{t('goHome')}</Link>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] mx-6 my-10">
            <div className="max-w-2xl mx-auto">
                <div className="text-center">
                    <CheckCircleIcon size={56} className="mx-auto text-green-500" />
                    <h1 className="text-3xl font-semibold text-slate-800 mt-4">{t('orderPlacedSuccess')}</h1>
                    <p className="text-slate-500 mt-2">
                        {t('orderNumber')}: <span className="font-mono font-medium text-slate-700">#{order.id.slice(-8)}</span>
                    </p>
                    <p className="text-sm text-slate-400 mt-1">{t('guestConfirmationNote')}</p>
                </div>

                <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <p className="font-medium text-slate-700">{t('orderDetails')}</p>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col gap-4">
                            {order.orderItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Image width={56} height={56} className="rounded bg-slate-100 p-1" src={item.product?.images?.[0] || '/assets/product_img1.png'} alt="" />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700">{item.product?.name}</p>
                                        <p className="text-xs text-slate-400">Qty: {item.quantity} · {format(item.price)} each</p>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">{format(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between text-sm">
                            <span className="text-slate-500">{t('total')}</span>
                            <span className="font-semibold text-slate-800 text-lg">{format(order.total)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border border-slate-200 rounded-xl p-6">
                    <p className="font-medium text-slate-700">{t('deliveryAddress')}</p>
                    <p className="text-sm text-slate-500 mt-2">
                        {order.address?.name}, {order.address?.street}<br />
                        {order.address?.city}, {order.address?.state}, {order.address?.zip}, {order.address?.country}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">{t('phone')}: {order.address?.phone}</p>
                </div>

                <div className="mt-8 text-center flex flex-col gap-3">
                    <Link href="/" className="bg-slate-800 text-white px-8 py-2.5 rounded-full text-sm hover:bg-slate-900">{t('continueShopping')}</Link>
                    <p className="text-xs text-slate-400">{t('guestAccountNote')}</p>
                </div>
            </div>
        </div>
    )
}

export default function OrderConfirmation() {
    return (
        <Suspense fallback={<Loading />}>
            <ConfirmationContent />
        </Suspense>
    )
}
