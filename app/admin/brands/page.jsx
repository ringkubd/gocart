'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Image from "next/image"

export default function AdminBrands() {

    const [brands, setBrands] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [editBrand, setEditBrand] = useState(null)
    const [form, setForm] = useState({ id: '', name: '', logo: '', active: true })

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/admin/brands')
            const data = await res.json()
            if (res.ok) setBrands(data.brands)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/brands', {
                method: form.id ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success(form.id ? 'Brand updated' : 'Brand added')
            setForm({ id: '', name: '', logo: '', active: true })
            setShowAdd(false)
            setEditBrand(null)
            fetchBrands()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const toggleActive = async (brand) => {
        try {
            const res = await fetch('/api/admin/brands', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: brand.id, active: !brand.active }),
            })
            if (!res.ok) throw new Error('Failed')
            setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, active: !brand.active } : b))
        } catch (error) {
            toast.error('Failed')
        }
    }

    const handleDelete = async (brand) => {
        if (!confirm(`Delete brand "${brand.name}"? Products will lose this brand.`)) return
        try {
            const res = await fetch('/api/admin/brands', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: brand.id }),
            })
            if (!res.ok) throw new Error('Failed')
            setBrands(prev => prev.filter(b => b.id !== brand.id))
            toast.success('Brand deleted')
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setForm(f => ({ ...f, logo: data.url }))
            toast.success('Logo uploaded')
        } catch (error) {
            toast.error('Upload failed')
        }
    }

    useEffect(() => {
        fetchBrands()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl">Brand <span className="text-slate-800 font-medium">Management</span></h1>
                <button onClick={() => { setShowAdd(!showAdd); setEditBrand(null); setForm({ id: '', name: '', logo: '', active: true }) }} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900">
                    <PlusIcon size={16} /> {showAdd ? 'Cancel' : 'Add Brand'}
                </button>
            </div>

            {(showAdd || editBrand) && (
                <form onSubmit={handleSubmit} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-lg flex flex-col gap-4 bg-slate-50/50">
                    <h3 className="font-medium text-slate-700">{editBrand ? 'Edit Brand' : 'Add New Brand'}</h3>
                    <label className="flex items-center gap-3">
                        <Image src={form.logo || "/assets/gs_logo.jpg"} width={48} height={48} className="rounded-full h-12 w-12 object-cover" alt="" />
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Brand Name</span>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-green-500" />
                        <span className="text-sm">Active</span>
                    </label>
                    <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">{editBrand ? 'Save Changes' : 'Add Brand'}</button>
                </form>
            )}

            <div className="mt-6 flex flex-col gap-3 max-w-2xl">
                {brands.map((brand) => (
                    <div key={brand.id} className={`border rounded-xl p-4 flex items-center gap-4 ${brand.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                        {brand.logo && <Image src={brand.logo} width={48} height={48} className="rounded-full h-12 w-12 object-cover" alt="" />}
                        <div className="flex-1">
                            <p className="font-medium text-slate-700">{brand.name}</p>
                            <p className="text-xs text-slate-400">/shop?brand={brand.slug} · {brand._count?.products || 0} products</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" onChange={() => toggleActive(brand)} checked={brand.active} />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                        </label>
                        <button onClick={() => { setEditBrand(brand); setForm({ id: brand.id, name: brand.name, logo: brand.logo, active: brand.active }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><PencilIcon size={16} /></button>
                        <button onClick={() => handleDelete(brand)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                    </div>
                ))}
                {brands.length === 0 && <p className="text-sm text-slate-400">No brands yet. Add your first brand.</p>}
            </div>
        </div>
    )
}
