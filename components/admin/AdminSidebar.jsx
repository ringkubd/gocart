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

const AdminSidebar = () => {

    const pathname = usePathname()
    const { data: session } = useSession()

    const linkGroups = [
        {
            label: 'Overview',
            links: [
                { name: 'Dashboard', href: '/admin', icon: HomeIcon },
            ],
        },
        {
            label: 'Orders & Sales',
            links: [
                { name: 'Orders', href: '/admin/orders', icon: LayoutListIcon },
                { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
            ],
        },
        {
            label: 'Catalog',
            links: [
                { name: 'Products', href: '/admin/products', icon: ShoppingBasketIcon },
                { name: 'Brands', href: '/admin/brands', icon: TagIcon },
                { name: 'Categories', href: '/admin/site-design', icon: PaletteIcon },
            ],
        },
        {
            label: 'Customers & Reviews',
            links: [
                { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
                { name: 'Reviews', href: '/admin/reviews', icon: MessageSquareIcon },
                { name: 'Newsletter', href: '/admin/newsletter', icon: MailIcon },
            ],
        },
        {
            label: 'Sellers',
            links: [
                { name: 'Stores', href: '/admin/stores', icon: StoreIcon },
                { name: 'Approve Store', href: '/admin/approve', icon: ShieldCheckIcon },
            ],
        },
        {
            label: 'Delivery & Payments',
            links: [
                { name: 'Shipping', href: '/admin/shipping', icon: TruckIcon },
                { name: 'Couriers', href: '/admin/couriers', icon: TruckIcon },
                { name: 'Payments', href: '/admin/payments', icon: BanknoteIcon },
            ],
        },
        {
            label: 'Support & Service',
            links: [
                { name: 'Support', href: '/admin/support', icon: HeadphonesIcon },
            ],
        },
        {
            label: 'Customization',
            links: [
                { name: 'Site Design', href: '/admin/site-design', icon: PaletteIcon },
                { name: 'SEO', href: '/admin/seo', icon: SearchIcon },
            ],
        },
        {
            label: 'System',
            links: [
                { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
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

            <div className="max-sm:mt-6 flex-1 overflow-y-auto no-scrollbar pb-6">
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
