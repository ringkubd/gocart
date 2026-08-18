'use client'
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

export default function StoreManageProducts() {

    const { symbol: currency } = useCurrency()
    const { t } = useLanguage()

    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState([])
    const [brands, setBrands] = useState([])
    const [editProduct, setEditProduct] = useState(null)
    const [editing, setEditing] = useState(false)

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/store/brands')
            const data = await res.json()
            if (res.ok) setBrands(data.brands)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/store/dashboard')
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

    const toggleStock = async (productId, inStock) => {
        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: !inStock }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update')
            }
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, inStock: !inStock } : p))
            toast.success('Stock updated')
        } catch (error) {
            toast.error(error.message || 'Failed to update')
        }
    }

    const handleDelete = async (product) => {
        if (!confirm(`Delete "${product.name}"?`)) return
        try {
            const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            setProducts(prev => prev.filter(p => p.id !== product.id))
            toast.success(t('productDeleted'))
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
                    deliveryCost: Number(editProduct.deliveryCost || 0),
                    freeDelivery: Boolean(editProduct.freeDelivery),
                    minQtyForFree: Number(editProduct.minQtyForFree || 0),
                    deliveryDiscount: Number(editProduct.deliveryDiscount || 0),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...data.product } : p))
            setEditing(false)
            setEditProduct(null)
            toast.success(t('productUpdated'))
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
            fetchProducts()
            fetchBrands()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">{t('productManagement')}</h1>
            {products.length ? (
            <table className="w-full max-w-4xl text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
                <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">{t('name')}</th>
                        <th className="px-4 py-3 hidden md:table-cell">{t('description')}</th>
                        <th className="px-4 py-3 hidden md:table-cell">{t('mrp')}</th>
                        <th className="px-4 py-3">{t('price')}</th>
                        <th className="px-4 py-3">{t('stock')}</th>
                        <th className="px-4 py-3">{t('inStock')}</th>
                        <th className="px-4 py-3">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex gap-2 items-center">
                                    <Image width={40} height={40} className='p-1 shadow rounded cursor-pointer' src={product.images[0]} alt="" />
                                    {product.name}
                                </div>
                            </td>
                            <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">{product.description}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{currency} {Number(product.mrp).toLocaleString()}</td>
                            <td className="px-4 py-3">{currency} {Number(product.price).toLocaleString()}</td>
                            <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.stock > 0 ? product.stock : 'Out'}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleStock(product.id, product.inStock), { loading: "Updating data..." })} checked={product.inStock} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditProduct(product); setEditing(true) }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><PencilIcon size={16} /></button>
                                    <button onClick={() => handleDelete(product)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            ) : (
                <p className="text-slate-400">{t('noProductsYet')}</p>
            )}

            {/* Edit modal */}
            {editing && editProduct && (
                <form onSubmit={saveEdit} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-slate-700 text-sm">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('editProduct')}</h2>
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
                                        <option value="">{t('noBrand')}</option>
                                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Stock Quantity</span>
                                    <input type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })} className="border border-slate-200 rounded p-2" />
                                </label>
                            </div>

                            {/* Delivery fields */}
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Delivery Cost (per item)</span>
                                    <input type="number" value={editProduct.deliveryCost || 0} onChange={(e) => setEditProduct({ ...editProduct, deliveryCost: e.target.value })} className="border border-slate-200 rounded p-2" />
                                </label>
                                <label className="flex items-center gap-2 mt-5">
                                    <input type="checkbox" checked={editProduct.freeDelivery || false} onChange={(e) => setEditProduct({ ...editProduct, freeDelivery: e.target.checked })} className="accent-green-500" />
                                    <span className="text-sm">Free Delivery</span>
                                </label>
                            </div>
                            {!editProduct.freeDelivery && (
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Min Qty for Free Delivery</span>
                                        <input type="number" value={editProduct.minQtyForFree || 0} onChange={(e) => setEditProduct({ ...editProduct, minQtyForFree: e.target.value })} className="border border-slate-200 rounded p-2" />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Delivery Discount %</span>
                                        <input type="number" value={editProduct.deliveryDiscount || 0} onChange={(e) => setEditProduct({ ...editProduct, deliveryDiscount: e.target.value })} className="border border-slate-200 rounded p-2" />
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => { setEditing(false); setEditProduct(null) }} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">Cancel</button>
                            <button className="px-5 py-2 bg-slate-800 text-white rounded hover:bg-slate-900">Save</button>
                        </div>
                    </div>
                </form>
            )}
        </>
    )
}
