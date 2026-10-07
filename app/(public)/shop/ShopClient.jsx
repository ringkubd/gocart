'use client'
import { Suspense, useState } from "react"
import Link from "next/link"
import { MoveLeftIcon, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import ProductCard from "@/components/ProductCard"
import { useLocalized } from "@/components/useLocalized"

function ShopContent({ products, categories, brands, category, brand, search, activeCat, activeBrand }) {
    const router = useRouter()
    const { text } = useLocalized()
    const [query, setQuery] = useState(search || "")

    const list = products && products.length ? products : []

    const heading = activeBrand ? activeBrand.name : (activeCat ? text(activeCat.name, activeCat.nameBn) : 'All')

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl text-slate-500 my-6 flex items-center gap-2">
                    {(search || category || brand) && (
                        <Link href="/shop" aria-label="Back to all products"><MoveLeftIcon size={20} /></Link>
                    )}
                    {heading} <span className="text-slate-700 font-medium">Products</span>
                </h1>

                {/* Search (server-driven via URL) */}
                <form
                    onSubmit={(e) => { e.preventDefault(); router.push(`/shop?search=${encodeURIComponent(query)}`) }}
                    className="flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-full max-w-md mb-6 text-sm"
                >
                    <Search size={16} className="text-slate-500" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-transparent outline-none placeholder-slate-500"
                    />
                </form>

                {/* Category chips */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Link href={brand ? `/shop?brand=${brand}` : '/shop'} className={`px-4 py-1.5 rounded-full text-sm border ${!category ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>All</Link>
                        {categories.map((cat) => {
                            const active = category === cat.slug || category === cat.name
                            return (
                                <Link key={cat.id} href={`/shop?category=${cat.slug}${brand ? `&brand=${brand}` : ''}`} className={`px-4 py-1.5 rounded-full text-sm border ${active ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    {text(cat.name, cat.nameBn)}
                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* Brand chips */}
                {brands.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Link href={category ? `/shop?category=${category}` : '/shop'} className={`px-4 py-1.5 rounded-full text-sm border ${!brand ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>All Brands</Link>
                        {brands.map((b) => {
                            const active = brand === b.slug || brand === b.name
                            return (
                                <Link key={b.id} href={`/shop?brand=${b.slug}${category ? `&category=${category}` : ''}`} className={`px-4 py-1.5 rounded-full text-sm border ${active ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    {b.name}
                                </Link>
                            )
                        })}
                    </div>
                )}

                {list.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-32">
                        {list.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className="text-slate-400 py-20 text-center">No products found.</div>
                )}
            </div>
        </div>
    )
}

export default function ShopClient(props) {
    return (
        <Suspense fallback={<div className="mx-6 py-20 text-center text-slate-400">Loading shop...</div>}>
            <ShopContent {...props} />
        </Suspense>
    )
}
