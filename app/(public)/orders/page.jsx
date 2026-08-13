'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { useLanguage } from "@/components/LanguageProvider";

export default function Orders() {

    const { status } = useSession();
    const router = useRouter();
    const { t } = useLanguage();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders')
            const data = await res.json()
            if (res.ok) {
                setOrders(data.orders)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (status === 'authenticated') {
            fetchOrders()
        } else if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status])

    if (status === 'loading' || loading) return <Loading />

    return (
        <div className="min-h-[70vh] mx-6">
            {orders.length > 0 ? (
                (
                    <div className="my-20 max-w-7xl mx-auto">
                        <PageTitle heading={t('myOrders')} text={`${t('showingProducts')} ${orders.length} ${t('orders')}`} linkText={t('goHome')} />

                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">{t('product')}</th>
                                    <th className="text-center">{t('totalPrice')}</th>
                                    <th className="text-left">{t('address')}</th>
                                    <th className="text-left">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">{t('youHaveNoOrders')}</h1>
                </div>
            )}
        </div>
    )
}
