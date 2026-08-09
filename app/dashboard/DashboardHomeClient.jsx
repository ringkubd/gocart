'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { ShoppingBagIcon, MapPinIcon, StarIcon } from "lucide-react"

export default function DashboardHomeClient() {

    const { data: session } = useSession()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/account')
            const data = await res.json()
            if (res.ok) setProfile(data.profile)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    if (loading) return <Loading />

    const cards = [
        { title: 'Total Orders', value: profile?._count?.buyerOrders || 0, icon: ShoppingBagIcon, href: '/dashboard/orders' },
        { title: 'Saved Addresses', value: profile?._count?.Address || 0, icon: MapPinIcon, href: '/dashboard/addresses' },
        { title: 'Reviews', value: profile?._count?.ratings || 0, icon: StarIcon, href: '/dashboard/orders' },
    ]

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Hello, <span className="text-slate-800 font-medium">{session?.user?.name?.split(' ')[0] || 'there'}</span> 👋</h1>
            <p className="text-sm text-slate-400 mt-1">Welcome to your account dashboard.</p>

            <div className="flex flex-wrap gap-5 mt-8">
                {cards.map((card, i) => (
                    <Link key={i} href={card.href} className="flex items-center gap-10 border border-slate-200 p-4 px-6 rounded-lg hover:border-slate-300 transition">
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-slate-400">{card.title}</p>
                            <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                        </div>
                        <card.icon size={40} className="w-10 h-10 p-2 text-slate-400 bg-slate-100 rounded-full" />
                    </Link>
                ))}
            </div>

            <div className="mt-10 border border-slate-200 rounded-xl p-6 max-w-xl">
                <h3 className="font-medium text-slate-700 mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Name</span>
                        <span className="text-slate-700 font-medium">{profile?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Email</span>
                        <span className="text-slate-700 font-medium">{profile?.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Role</span>
                        <span className="text-slate-700 font-medium capitalize">{profile?.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Member Since</span>
                        <span className="text-slate-700 font-medium">{profile ? new Date(profile.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
