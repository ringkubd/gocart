'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { PlusIcon, PencilIcon, Trash2Icon, StoreIcon, ShoppingBasketIcon } from "lucide-react"
import Image from "next/image"

export default function AdminStores() {

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)

    const [showAdd, setShowAdd] = useState(false)
    const [editStore, setEditStore] = useState(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        name: '', email: '', password: '',
        storeName: '', username: '', description: '', contact: '', address: '', logo: '',
    })

    const fetchStores = async () => {
        try {
            const res = await fetch('/api/admin/dashboard')
            const data = await res.json()
            if (res.ok) {
                setStores(data.storesList)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleIsActive = async (storeId, isActive) => {
        try {
            const res = await fetch('/api/admin/stores', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, isActive: !isActive }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            setStores(prev => prev.map(s => s.id === storeId ? { ...s, isActive: !isActive } : s))
            toast.success(!isActive ? 'Store activated' : 'Store disabled')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const handleAddSeller = async (e) => {
        e.preventDefault()
        if (saving) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/sellers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Seller store created')
            setShowAdd(false)
            setForm({ name: '', email: '', password: '', storeName: '', username: '', description: '', contact: '', address: '', logo: '' })
            fetchStores()
        } catch (error) {
            toast.error(error.message || 'Failed')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        if (saving) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/sellers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editStore.id, ...form }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Store updated')
            setEditStore(null)
            setForm({ name: '', email: '', password: '', storeName: '', username: '', description: '', contact: '', address: '', logo: '' })
            fetchStores()
        } catch (error) {
            toast.error(error.message || 'Failed')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (store) => {
        if (!confirm(`Delete store "${store.name}" and all its products? This cannot be undone.`)) return
        try {
            const res = await fetch('/api/admin/sellers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: store.id }),
            })
            if (!res.ok) throw new Error('Failed')
            setStores(prev => prev.filter(s => s.id !== store.id))
            toast.success('Store deleted')
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const startEdit = (store) => {
        setEditStore(store)
        setForm({
            name: store.user?.name || '',
            email: store.user?.email || '',
            password: '',
            storeName: store.name,
            username: store.username,
            description: store.description,
            contact: store.contact,
            address: store.address,
            logo: store.logo,
        })
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
        fetchStores()
    }, [])

    if (loading) return <Loading />

    const inputCls = "border border-slate-200 rounded p-2 text-sm w-full"

    return (
        <div className="text-slate-500 mb-28">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Management</span></h1>
                <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900">
                    <PlusIcon size={16} /> {showAdd ? 'Cancel' : 'Add Seller'}
                </button>
            </div>
            <p className="text-sm text-slate-400 mt-1">Sellers are created and managed by the admin. Public signup is disabled.</p>

            {/* Add / Edit Seller form */}
            {(showAdd || editStore) && (
                <form onSubmit={editStore ? handleEdit : handleAddSeller} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-2xl flex flex-col gap-4 bg-slate-50/50">
                    <h3 className="font-medium text-slate-700">{editStore ? `Edit Store — ${editStore.name}` : 'Create New Seller Store'}</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 col-span-2">
                            <span className="text-xs text-slate-400">Store Logo</span>
                            <div className="flex items-center gap-3">
                                <Image src={form.logo || "/assets/happy_store.webp"} width={56} height={56} className="rounded-full h-14 w-14 object-cover" alt="" />
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
                            </div>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Owner Name</span>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Owner Email (login)</span>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required disabled={!!editStore} />
                        </label>
                        {!editStore && (
                            <label className="flex flex-col gap-1 col-span-2">
                                <span className="text-xs text-slate-400">Login Password (share with the seller)</span>
                                <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} required minLength={6} />
                            </label>
                        )}
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Store Name</span>
                            <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className={inputCls} required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Store Username (URL)</span>
                            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputCls} required disabled={!!editStore} />
                        </label>
                        <label className="flex flex-col gap-1 col-span-2">
                            <span className="text-xs text-slate-400">Description</span>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Contact Number</span>
                            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputCls} />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Address</span>
                            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button disabled={saving} className="bg-slate-800 text-white px-6 py-2 rounded text-sm disabled:opacity-50">{saving ? 'Saving...' : editStore ? 'Save Changes' : 'Create Seller'}</button>
                        {editStore && <button type="button" onClick={() => setEditStore(null)} className="text-sm text-slate-400 hover:text-slate-600 px-2">Cancel</button>}
                    </div>
                </form>
            )}

            {/* Store list */}
            {stores.length ? (
                <div className="flex flex-col gap-4 mt-6">
                    {stores.map((store) => (
                        <div key={store.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-4 md:items-center max-w-4xl">
                            <Image width={60} height={60} src={store.logo || "/assets/happy_store.webp"} alt={store.name} className="rounded-full h-14 w-14 object-cover" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-semibold text-slate-800">{store.name}</h3>
                                    <span className="text-sm text-slate-400">@{store.username}</span>
                                    <span className={`text-xs font-semibold px-4 py-1 rounded-full ${store.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                                        {store.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{store.user?.name} · {store.user?.email}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><ShoppingBasketIcon size={14} /> {store._count?.Product || 0} products</span>
                                    <span className="flex items-center gap-1"><StoreIcon size={14} /> {store._count?.Order || 0} orders</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer text-gray-900">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toast.promise(toggleIsActive(store.id, store.isActive), { loading: "Updating..." })} checked={store.isActive} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                                <button onClick={() => startEdit(store)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><PencilIcon size={16} /></button>
                                <button onClick={() => handleDelete(store)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">No stores yet. Add your first seller.</h1>
                </div>
            )}
        </div>
    )
}
