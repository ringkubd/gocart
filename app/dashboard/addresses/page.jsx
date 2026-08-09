'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { MapPinIcon, PlusIcon, Trash2Icon } from "lucide-react"

export default function DashboardAddresses() {

    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', street: '', city: '', state: '', zip: '', country: '', phone: '' })

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/addresses')
            const data = await res.json()
            if (res.ok) setAddresses(data.addresses)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to add address')
            toast.success('Address added')
            setShowForm(false)
            setForm({ name: '', email: '', street: '', city: '', state: '', zip: '', country: '', phone: '' })
            fetchAddresses()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    if (loading) return <Loading />

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl text-slate-700 font-medium">My Addresses</h1>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900">
                    <PlusIcon size={16} /> {showForm ? 'Cancel' : 'Add Address'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className="border border-slate-200 rounded-xl p-6 mb-6 max-w-xl flex flex-col gap-3">
                    <h3 className="font-medium text-slate-700">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="border border-slate-200 rounded p-2 text-sm" required />
                        <input name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="border border-slate-200 rounded p-2 text-sm" required />
                        <input name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="border border-slate-200 rounded p-2 text-sm col-span-2" required />
                        <input name="street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="Street / House" className="border border-slate-200 rounded p-2 text-sm col-span-2" required />
                        <input name="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="border border-slate-200 rounded p-2 text-sm" required />
                        <input name="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State / Division" className="border border-slate-200 rounded p-2 text-sm" required />
                        <input name="zip" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="Zip code" className="border border-slate-200 rounded p-2 text-sm" required />
                        <input name="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="border border-slate-200 rounded p-2 text-sm" required />
                    </div>
                    <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Address</button>
                </form>
            )}

            {addresses.length === 0 ? (
                <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <MapPinIcon size={40} className="mx-auto mb-3 opacity-40" />
                    <p>No saved addresses.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                    {addresses.map((addr, i) => (
                        <div key={i} className="border border-slate-200 rounded-xl p-5">
                            <p className="font-medium text-slate-700">{addr.name}</p>
                            <p className="text-sm text-slate-500 mt-1">{addr.street}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}</p>
                            <p className="text-sm text-slate-500 mt-1">{addr.phone} · {addr.email}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
