'use client'

import { usePathname } from "next/navigation"
import {
    HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon, ShoppingBasketIcon,
    LayoutListIcon, UsersIcon, PaletteIcon, TruckIcon, SettingsIcon, SearchIcon,
    TagIcon, HeadphonesIcon, BanknoteIcon, MessageSquareIcon, MailIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/components/LanguageProvider"

const AdminSidebar = () => {

    const pathname = usePathname()
    const { data: session } = useSession()
    const { t } = useLanguage()

    const linkGroups = [
        {
            label: t('overview'),
            links: [
                { name: t('dashboard'), href: '/admin', icon: HomeIcon },
            ],
        },
        {
            label: t('ordersSales'),
            links: [
                { name: t('orders'), href: '/admin/orders', icon: LayoutListIcon },
                { name: t('coupons'), href: '/admin/coupons', icon: TicketPercentIcon },
            ],
        },
        {
            label: t('catalog'),
            links: [
                { name: t('products'), href: '/admin/products', icon: ShoppingBasketIcon },
                { name: t('brands'), href: '/admin/brands', icon: TagIcon },
                { name: t('categories'), href: '/admin/site-design', icon: PaletteIcon },
            ],
        },
        {
            label: t('usersReviews'),
            links: [
                { name: t('users'), href: '/admin/users', icon: UsersIcon },
                { name: t('reviews'), href: '/admin/reviews', icon: MessageSquareIcon },
                { name: t('newsletter'), href: '/admin/newsletter', icon: MailIcon },
            ],
        },
        {
            label: t('sellers'),
            links: [
                { name: t('stores'), href: '/admin/stores', icon: StoreIcon },
                { name: t('approveStore'), href: '/admin/approve', icon: ShieldCheckIcon },
            ],
        },
        {
            label: t('deliveryPayments'),
            links: [
                { name: t('shipping'), href: '/admin/shipping', icon: TruckIcon },
                { name: t('couriers'), href: '/admin/couriers', icon: TruckIcon },
                { name: t('payments'), href: '/admin/payments', icon: BanknoteIcon },
            ],
        },
        {
            label: t('supportService'),
            links: [
                { name: t('supportTickets'), href: '/admin/support', icon: HeadphonesIcon },
            ],
        },
        {
            label: t('customization'),
            links: [
                { name: t('siteDesign'), href: '/admin/site-design', icon: PaletteIcon },
                { name: t('seo'), href: '/admin/seo', icon: SearchIcon },
            ],
        },
        {
            label: t('system'),
            links: [
                { name: t('settings'), href: '/admin/settings', icon: SettingsIcon },
            ],
        },
    ]

    const isActive = (href) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

    return (
        <div className="inline-flex h-full flex-col border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-6 pb-2 max-sm:hidden">
                <Image className="w-14 h-14 rounded-full" src={session?.user?.image || "/assets/gs_logo.jpg"} alt="" width={80} height={80} />
                <p className="text-slate-700">{session?.user?.name || 'Admin'}</p>
            </div>

            <div className="max-sm:mt-6 flex-1 overflow-y-auto no-scrollbar pb-12">
                {linkGroups.map((group, gi) => (
                    <div key={gi} className="mb-1">
                        <p className="px-6 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 max-sm:hidden">
                            {group.label}
                        </p>
                        {group.links.map((link, index) => (
                            <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${isActive(link.href) && 'bg-slate-100 sm:text-slate-600'}`}>
                                <link.icon size={18} className="sm:ml-5" />
                                <p className="max-sm:hidden">{link.name}</p>
                                {isActive(link.href) && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                            </Link>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AdminSidebar
