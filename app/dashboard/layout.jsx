'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, MapPinIcon, UserIcon, LogOutIcon } from "lucide-react"
import { signOut } from "next-auth/react"
import { useLanguage } from "@/components/LanguageProvider"

export default function DashboardLayout({ children }) {

    const { status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const { t } = useLanguage()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') return <Loading />

    const links = [
        { name: t('overview'), href: '/dashboard', icon: HomeIcon },
        { name: t('myOrders'), href: '/dashboard/orders', icon: LayoutListIcon },
        { name: t('myAddresses'), href: '/dashboard/addresses', icon: MapPinIcon },
        { name: t('myProfile'), href: '/dashboard/profile', icon: UserIcon },
    ]

    const isActive = (href) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

    return (
        <div className="min-h-[70vh] mx-6 my-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-56 shrink-0">
                    <div className="border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                        {links.map((link) => (
                            <Link key={link.href} href={link.href} className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition ${isActive(link.href) ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <link.icon size={16} /> {link.name}
                            </Link>
                        ))}
                        <button onClick={() => signOut()} className="flex items-center gap-3 p-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition">
                            <LogOutIcon size={16} /> {t('logout')}
                        </button>
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    )
}
