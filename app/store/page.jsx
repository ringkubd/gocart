'use client'
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

export default function Dashboard() {

    const { symbol: currency } = useCurrency()
    const { t } = useLanguage()

    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalEarnings: 0,
        totalOrders: 0,
        ratings: [],
        revenueByDay: {},
        statusBreakdown: {},
    })

    const dashboardCardsData = [
        { title: t('totalProductsCount'), value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: t('totalEarnings'), value: currency + Number(dashboardData.totalEarnings).toLocaleString(), icon: CircleDollarSignIcon },
        { title: t('orders'), value: dashboardData.totalOrders, icon: TagsIcon },
        { title: t('totalRatings'), value: dashboardData.ratings.length, icon: StarIcon },
    ]

    const chartData = Object.entries(dashboardData.revenueByDay)
        .map(([date, value]) => ({ date, revenue: value }))
        .sort((a, b) => a.date.localeCompare(b.date))

    const statusLabels = {
        ORDER_PLACED: 'Order Placed',
        PROCESSING: 'Processing',
        SHIPPED: 'Shipped',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
    }

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/store/dashboard')
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
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">{t('sellerDashboard')}</h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Earnings chart */}
            <div className="w-full max-w-3xl h-72 mb-10">
                <h3 className="font-medium text-slate-700 mb-4">{t('totalEarnings')} / Day</h3>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={11} />
                            <YAxis fontSize={11} />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="#86efac" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-sm text-slate-400">{t('noSalesYet')}</p>
                )}
            </div>

            <h2>{t('reviews')}</h2>

            <div className="mt-5">
                {
                    dashboardData.ratings.length ? dashboardData.ratings.map((review, index) => (
                        <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                            <div>
                                <div className="flex gap-3">
                                    <Image src={review.user?.image || '/assets/profile_pic1.jpg'} alt="" className="w-10 aspect-square rounded-full" width={100} height={100} />
                                    <div>
                                        <p className="font-medium">{review.user?.name}</p>
                                        <p className="font-light text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-500 max-w-xs leading-6">{review.review}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:items-end">
                                <div className="flex flex-col sm:items-end">
                                    <p className="text-slate-400">{review.product?.category}</p>
                                    <p className="font-medium">{review.product?.name}</p>
                                    <div className='flex items-center'>
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon key={index} size={17} className='text-transparent mt-0.5' fill={review.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                {review.product && <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all">{t('viewProduct')}</button>}
                            </div>
                        </div>
                    )) : (
                        <p className="text-slate-400 text-sm mt-4">{t('noReviewsYet')}</p>
                    )
                }
            </div>
        </div>
    )
}
