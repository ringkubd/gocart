'use client'
import { Search, ShoppingCart, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useCurrency } from "./useCurrency";

const Navbar = () => {

    const router = useRouter();
    const { data: session, status } = useSession();
    const dropdownRef = useRef(null);
    const currencyRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);

    const { code, list, setCurrencyCode } = useCurrency();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
            if (currencyRef.current && !currencyRef.current.contains(e.target)) {
                setCurrencyOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        theDhaka<span className="text-green-600">Shop</span><span className="text-green-600 text-5xl leading-0">.</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/orders">Orders</Link>
                        <Link href="/support">Support</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link>

                        {/* Currency switcher */}
                        {list.length > 1 && (
                            <div ref={currencyRef} className="relative">
                                <button onClick={() => setCurrencyOpen(!currencyOpen)} className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-full">
                                    {code} <ChevronDown size={14} />
                                </button>
                                {currencyOpen && (
                                    <div className="absolute right-0 top-10 bg-white shadow-lg border border-slate-200 rounded-lg py-1 w-44 z-50">
                                        {list.map((c) => (
                                            <button key={c.code} onClick={() => { setCurrencyCode(c.code, c.symbol); setCurrencyOpen(false) }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${c.code === code ? 'text-green-600 font-medium' : 'text-slate-600'}`}>
                                                {c.code} — {c.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {status === "authenticated" ? (
                            <div ref={dropdownRef} className="relative">
                                <button onClick={() => setMenuOpen(!menuOpen)} className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full text-sm">
                                    {session.user.name?.split(' ')[0]}
                                </button>
                                {menuOpen && (
                                    <div className="absolute right-0 top-12 bg-white shadow-lg border border-slate-200 rounded-lg py-2 w-48 z-50">
                                        {session.user.role === 'admin' && (
                                            <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm text-slate-600">
                                                <LayoutDashboard size={16} /> Admin Panel
                                            </Link>
                                        )}
                                        {(session.user.storeId || session.user.role === 'admin') && (
                                            <Link href="/store" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm text-slate-600">
                                                <LayoutDashboard size={16} /> Store Dashboard
                                            </Link>
                                        )}
                                        <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm text-slate-600">
                                            <LayoutDashboard size={16} /> My Account
                                        </Link>
                                        <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm text-red-600 w-full text-left">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                                Login
                            </Link>
                        )}

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        <Link href={status === "authenticated" ? "/dashboard" : "/login"} className="px-7 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full">
                            {status === "authenticated" ? "Account" : "Login"}
                        </Link>
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar
