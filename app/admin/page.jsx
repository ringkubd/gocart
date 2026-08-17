'use client'
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon, UsersIcon, ClockIcon } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

export default function AdminDashboard() {

    const { format } = useCurrency()
    const { t } = useLanguage()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        stores: 0,
        users: 0,
        pendingStores: 0,
        recentOrders: [],
        topProducts: [],
        topStores: [],
        statusBreakdown: {},
    })

    const dashboardCardsData = [
        { title: t('totalRevenue'), value: format(dashboardData.revenue), icon: CircleDollarSignIcon },
        { title: t('orders'), value: dashboardData.orders, icon: TagsIcon },
        { title: t('totalProductsCount'), value: dashboardData.products, icon: ShoppingBasketIcon },
        { title: t('totalStores'), value: dashboardData.stores, icon: StoreIcon },
        { title: t('totalCustomers'), value: dashboardData.users, icon: UsersIcon },
        { title: t('pendingStores'), value: dashboardData.pendingStores, icon: ClockIcon },
    ]

    const statusLabels = {
        ORDER_PLACED: 'Order Placed',
        PROCESSING: 'Processing',
        SHIPPED: 'Shipped',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
    }

    const statusColors = {
        ORDER_PLACED: 'bg-yellow-100 text-yellow-700',
        PROCESSING: 'bg-blue-100 text-blue-700',
        SHIPPED: 'bg-indigo-100 text-indigo-700',
        DELIVERED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-red-100 text-red-700',
    }

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/admin/dashboard')
            const data = await res.json()
            if (res.ok) {
                setDashboardData(data.dashboardData)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">{t('adminDashboard')}</h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-8">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                {/* Order status breakdown */}
                <div className="border border-slate-200 rounded-xl p-6">
                    <h3 className="font-medium text-slate-700 mb-4">{t('orderStatus')}</h3>
                    <div className="space-y-3">
                        {Object.entries(dashboardData.statusBreakdown).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className={`text-xs px-3 py-1 rounded-full ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>{statusLabels[status] || status}</span>
                                <span className="font-medium text-slate-700">{count}</span>
                            </div>
                        ))}
                        {Object.keys(dashboardData.statusBreakdown).length === 0 && <p className="text-sm text-slate-400">{t('youHaveNoOrders')}.</p>}
                    </div>
                </div>

                {/* Top products */}
                <div className="border border-slate-200 rounded-xl p-6">
                    <h3 className="font-medium text-slate-700 mb-4">{t('topProducts')}</h3>
                    <div className="space-y-3">
                        {dashboardData.topProducts.map((p, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <img src={p.image} alt="" className="w-10 h-10 object-cover rounded" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
                                    <p className="text-xs text-slate-400">{p.qty} sold</p>
                                </div>
                                <span className="text-sm font-medium text-slate-700">{format(p.price)}</span>
                            </div>
                        ))}
                        {dashboardData.topProducts.length === 0 && <p className="text-sm text-slate-400">{t('noSalesYet')}</p>}
                    </div>
                </div>
            </div>

            {/* Top stores */}
            <div className="mt-6 max-w-5xl">
                <h3 className="font-medium text-slate-700 mb-4">{t('topStores')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.topStores.map((s, i) => (
                        <div key={i} className="border border-slate-200 rounded-xl p-4">
                            <p className="font-medium text-slate-700">{s.name}</p>
                            <p className="text-xs text-slate-400 mb-2">@{s.username}</p>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{s.orders} orders</span>
                                <span className="font-medium text-slate-700">{format(s.revenue)}</span>
                            </div>
                        </div>
                    ))}
                    {dashboardData.topStores.length === 0 && <p className="text-sm text-slate-400">{t('noSalesYet')}</p>}
                </div>
            </div>

            {/* Recent orders */}
            <div className="mt-8 max-w-5xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-700">{t('recentOrders')}</h3>
                    <Link href="/admin/orders" className="text-sm text-green-600 hover:text-green-700">{t('viewAll')}</Link>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">Order</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Store</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dashboardData.recentOrders.map((o) => (
                                <tr key={o.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">#{o.id.slice(-8)}</td>
                                    <td className="px-4 py-3 text-slate-600">{o.user?.name}</td>
                                    <td className="px-4 py-3 text-slate-500">{o.store?.name}</td>
                                    <td className="px-4 py-3 font-medium text-slate-700">{format(o.total)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-3 py-1 rounded-full ${statusColors[o.status] || 'bg-slate-100 text-slate-600'}`}>{statusLabels[o.status] || o.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {dashboardData.recentOrders.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No orders yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
