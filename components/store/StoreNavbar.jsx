'use client'
import Link from "next/link"

const StoreNavbar = ({ storeInfo }) => {

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">theDhaka</span><span className="text-slate-700">Shop</span><span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Store
                </p>
            </Link>
            <div className="flex items-center gap-3">
                <Link href={`/shop/${storeInfo?.username || '#'}`} className="text-sm text-slate-500 hover:text-slate-700">View Store</Link>
                <p>Hi, {storeInfo?.name?.split(' ')[0] || 'Seller'}</p>
            </div>
        </div>
    )
}

export default StoreNavbar
