'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"

export default function DashboardProfile() {

    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', email: '', password: '' })

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/account')
            const data = await res.json()
            if (res.ok) {
                setForm({ name: data.profile.name, email: data.profile.email, password: '' })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            const payload = { name: form.name }
            if (form.password) payload.password = form.password

            const res = await fetch('/api/account', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update')
            toast.success('Profile updated')
            setForm(f => ({ ...f, password: '' }))
            if (update) update({ name: form.name })
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl text-slate-700 font-medium mb-6">My Profile</h1>

            <form onSubmit={handleSave} className="border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Full Name</span>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Email (cannot be changed)</span>
                    <input value={form.email} disabled className="border border-slate-100 rounded p-2 text-sm bg-slate-50 text-slate-400" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">New Password (leave blank to keep current)</span>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="border border-slate-200 rounded p-2 text-sm" minLength={6} />
                </label>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit hover:bg-slate-900">Save Changes</button>
            </form>
        </div>
    )
}
