'use client'
import { Suspense } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import useStorefrontData from "@/components/useStorefrontData"

 function ShopContent() {

    // get query params ?search=abc
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const router = useRouter()

    const products = useSelector(state => state.product.list)
    const { categories, brands } = useStorefrontData()

    const filteredProducts = products.filter(product => {
        const matchesSearch = search
            ? product.name.toLowerCase().includes(search.toLowerCase())
            : true
        const matchesCategory = category
            ? product.category.toLowerCase() === category.toLowerCase()
            : true
        const matchesBrand = brand
            ? (product.brand?.slug === brand || product.brand?.name?.toLowerCase() === brand.toLowerCase())
            : true
        return matchesSearch && matchesCategory && matchesBrand
    })

    const activeCat = category
        ? categories.find(c => c.slug === category || c.name.toLowerCase() === category.toLowerCase())
        : null

    const activeBrand = brand
        ? brands.find(b => b.slug === brand || b.name.toLowerCase() === brand.toLowerCase())
        : null

    return (
        <div className="min-h-[70vh] mx-6">
            <div className=" max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer">
                    {(search || category || brand) && <MoveLeftIcon size={20} />}
                    {activeBrand ? activeBrand.name : (activeCat ? activeCat.name : 'All')} <span className="text-slate-700 font-medium">Products</span>
                </h1>

                {/* Category chips */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button onClick={() => router.push(brand ? `/shop?brand=${brand}` : '/shop')} className={`px-4 py-1.5 rounded-full text-sm border ${!category ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>All</button>
                        {categories.map((cat) => (
                            <button key={cat.id} onClick={() => router.push(`/shop?category=${cat.slug}${brand ? `&brand=${brand}` : ''}`)} className={`px-4 py-1.5 rounded-full text-sm border ${category === cat.slug || category === cat.name ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Brand chips */}
                {brands.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button onClick={() => router.push(category ? `/shop?category=${category}` : '/shop')} className={`px-4 py-1.5 rounded-full text-sm border ${!brand ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>All Brands</button>
                        {brands.map((b) => (
                            <button key={b.id} onClick={() => router.push(`/shop?brand=${b.slug}${category ? `&category=${category}` : ''}`)} className={`px-4 py-1.5 rounded-full text-sm border ${brand === b.slug || brand === b.name ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                {b.name}
                            </button>
                        ))}
                    </div>
                )}

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className="text-slate-400 py-20 text-center">No products found.</div>
                )}
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
