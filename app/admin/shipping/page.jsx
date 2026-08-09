'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { PencilIcon, Trash2Icon } from "lucide-react"

export default function AdminShipping() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const [methods, setMethods] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ id: '', name: '', cost: '', deliveryTime: '', active: true })

    const fetchMethods = async () => {
        try {
            const res = await fetch('/api/admin/shipping')
            const data = await res.json()
            if (res.ok) {
                setMethods(data.methods)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = '/api/admin/shipping'
            const res = await fetch(url, {
                method: form.id ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success(form.id ? 'Shipping method updated' : 'Shipping method added')
            setForm({ id: '', name: '', cost: '', deliveryTime: '', active: true })
            fetchMethods()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const toggleActive = async (method) => {
        try {
            const res = await fetch('/api/admin/shipping', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: method.id, active: !method.active }),
            })
            if (!res.ok) throw new Error('Failed')
            setMethods(prev => prev.map(m => m.id === method.id ? { ...m, active: !method.active } : m))
        } catch (error) {
            toast.error('Failed')
        }
    }

    const handleDelete = async (method) => {
        if (!confirm(`Delete "${method.name}"?`)) return
        try {
            const res = await fetch('/api/admin/shipping', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: method.id }),
            })
            if (!res.ok) throw new Error('Failed')
            setMethods(prev => prev.filter(m => m.id !== method.id))
            toast.success('Shipping method deleted')
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const editMethod = (method) => {
        setForm({ id: method.id, name: method.name, cost: method.cost, deliveryTime: method.deliveryTime, active: method.active })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        fetchMethods()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">Shipping & <span className="text-slate-800 font-medium">Delivery</span></h1>
            <p className="text-sm text-slate-400 mt-1">Manage delivery zones and charges shown at checkout.</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-lg mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">{form.id ? 'Edit Shipping Method' : 'Add Shipping Method'}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 col-span-2">
                        <span className="text-xs text-slate-400">Method Name</span>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Inside Dhaka, Outside Dhaka" className="border border-slate-200 rounded p-2 text-sm" required />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Delivery Charge ({currency})</span>
                        <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0" className="border border-slate-200 rounded p-2 text-sm" required />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Delivery Time</span>
                        <input value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} placeholder="e.g. 1-2 days" className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm hover:bg-slate-900">
                        {form.id ? 'Update Method' : 'Add Method'}
                    </button>
                    {form.id && <button type="button" onClick={() => setForm({ id: '', name: '', cost: '', deliveryTime: '', active: true })} className="text-sm text-slate-400 hover:text-slate-600">Cancel</button>}
                </div>
            </form>

            {/* List */}
            <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 max-w-4xl">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Cost</th>
                            <th className="px-4 py-3">Delivery Time</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {methods.map((method) => (
                            <tr key={method.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-700">{method.name}</td>
                                <td className="px-4 py-3">{currency}{method.cost}</td>
                                <td className="px-4 py-3 text-slate-500">{method.deliveryTime || '—'}</td>
                                <td className="px-4 py-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" onChange={() => toggleActive(method)} checked={method.active} />
                                        <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                        <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                    </label>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => editMethod(method)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><PencilIcon size={16} /></button>
                                        <button onClick={() => handleDelete(method)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {methods.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No shipping methods. Add one above.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
