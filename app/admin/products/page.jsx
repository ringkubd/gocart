'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"
import { PencilIcon, Trash2Icon, StarIcon } from "lucide-react"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

export default function AdminProducts() {

    const { symbol: currency } = useCurrency()
    const { t } = useLanguage()

    const [products, setProducts] = useState([])
    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [editProduct, setEditProduct] = useState(null)
    const [editing, setEditing] = useState(false)

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/admin/brands')
            const data = await res.json()
            if (res.ok) setBrands(data.brands)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            const res = await fetch(`/api/admin/products?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                setProducts(data.products)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleFeatured = async (product) => {
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ featured: !product.featured }),
            })
            if (!res.ok) throw new Error('Failed')
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: !product.featured } : p))
            toast.success(t('featured'))
        } catch (error) {
            toast.error('Failed to update')
        }
    }

    const toggleStock = async (product) => {
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: !product.inStock }),
            })
            if (!res.ok) throw new Error('Failed')
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, inStock: !product.inStock } : p))
            toast.success('Stock updated')
        } catch (error) {
            toast.error('Failed to update')
        }
    }

    const handleDelete = async (product) => {
        if (!confirm(`Delete "${product.name}"?`)) return
        try {
            const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed')
            setProducts(prev => prev.filter(p => p.id !== product.id))
            toast.success('Product deleted')
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const saveEdit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch(`/api/products/${editProduct.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editProduct.name,
                    nameBn: editProduct.nameBn || "",
                    description: editProduct.description,
                    descriptionBn: editProduct.descriptionBn || "",
                    mrp: Number(editProduct.mrp),
                    price: Number(editProduct.price),
                    category: editProduct.category,
                    categoryBn: editProduct.categoryBn || "",
                    brandId: editProduct.brandId || null,
                    stock: Number(editProduct.stock),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...data.product } : p))
            setEditing(false)
            setEditProduct(null)
            toast.success('Product updated')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchBrands()
    }, [])

    if (loading && products.length === 0) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl">{t('productManagementTitle')}</h1>
                <form onSubmit={(e) => { e.preventDefault(); fetchProducts() }} className="flex gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchProducts')} className="border border-slate-200 outline-slate-400 p-2 rounded text-sm w-60" />
                    <button className="bg-slate-700 text-white px-4 rounded text-sm">{t('search')}</button>
                </form>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 max-w-6xl">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">{t('product')}</th>
                            <th className="px-4 py-3">{t('store')}</th>
                            <th className="px-4 py-3">{t('category')}</th>
                            <th className="px-4 py-3">{t('mrp')}</th>
                            <th className="px-4 py-3">{t('price')}</th>
                            <th className="px-4 py-3">{t('stock')}</th>
                            <th className="px-4 py-3">{t('featured')}</th>
                            <th className="px-4 py-3">{t('sold')}</th>
                            <th className="px-4 py-3">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 items-center">
                                        <Image width={40} height={40} className='p-0.5 rounded' src={product.images?.[0]} alt="" />
                                        <span className="max-w-40 truncate">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs">{product.store?.name}</td>
                                <td className="px-4 py-3 text-xs">{product.category}</td>
                                <td className="px-4 py-3 text-slate-400 line-through">{currency}{product.mrp}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{currency}{product.price}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock > 0 ? product.stock + ' ' + t('inStockLabel') : t('out')}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <button onClick={() => toggleFeatured(product)} className={`p-1.5 rounded-full transition ${product.featured ? 'bg-green-100 text-green-600' : 'text-slate-300 hover:text-slate-500'}`}>
                                        <StarIcon size={18} fill={product.featured ? "currentColor" : "none"} />
                                    </button>
                                </td>
                                <td className="px-4 py-3">{product._count?.orderItems || 0}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleStock(product)} className={`text-xs px-3 py-1 rounded-full border ${product.inStock ? 'border-green-300 text-green-600 hover:bg-green-50' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                                            {product.inStock ? t('active') : t('inactive')}
                                        </button>
                                        <button onClick={() => { setEditProduct(product); setEditing(true) }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><PencilIcon size={16} /></button>
                                        <button onClick={() => handleDelete(product)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">{t('noProductsFoundAdmin')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit modal */}
            {editing && editProduct && (
                <form onSubmit={saveEdit} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-slate-700 text-sm">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Edit Product</h2>
                        <div className="flex flex-col gap-3">
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Name (English)</span>
                                <input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="border border-slate-200 rounded p-2" required />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Name (বাংলা)</span>
                                <input value={editProduct.nameBn || ''} onChange={(e) => setEditProduct({ ...editProduct, nameBn: e.target.value })} className="border border-slate-200 rounded p-2" />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Description (English)</span>
                                <textarea value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} rows={3} className="border border-slate-200 rounded p-2" required />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Description (বাংলা)</span>
                                <textarea value={editProduct.descriptionBn || ''} onChange={(e) => setEditProduct({ ...editProduct, descriptionBn: e.target.value })} rows={3} className="border border-slate-200 rounded p-2" />
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">MRP ({currency})</span>
                                    <input type="number" value={editProduct.mrp} onChange={(e) => setEditProduct({ ...editProduct, mrp: e.target.value })} className="border border-slate-200 rounded p-2" required />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Price ({currency})</span>
                                    <input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })} className="border border-slate-200 rounded p-2" required />
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Category</span>
                                    <input value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} className="border border-slate-200 rounded p-2" required />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Brand</span>
                                    <select value={editProduct.brandId || ''} onChange={(e) => setEditProduct({ ...editProduct, brandId: e.target.value })} className="border border-slate-200 rounded p-2">
                                        <option value="">No brand</option>
                                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Stock Quantity</span>
                                    <input type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })} className="border border-slate-200 rounded p-2" />
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => { setEditing(false); setEditProduct(null) }} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">Cancel</button>
                            <button className="px-5 py-2 bg-slate-800 text-white rounded hover:bg-slate-900">Save</button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    )
}
