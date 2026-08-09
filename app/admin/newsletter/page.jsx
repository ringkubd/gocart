'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Trash2Icon, MailIcon } from "lucide-react"

export default function AdminNewsletter() {

    const [subscribers, setSubscribers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [settings, setSettings] = useState({ active: true, title: 'Join Newsletter', description: '' })

    const fetchNewsletter = async () => {
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            const res = await fetch(`/api/admin/newsletter?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                setSubscribers(data.subscribers)
                setSettings(data.newsletterSettings)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Newsletter settings saved')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const toggleActive = async () => {
        const next = !settings.active
        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: next }),
            })
            if (!res.ok) throw new Error('Failed')
            setSettings(s => ({ ...s, active: next }))
            toast.success(next ? 'Newsletter section shown' : 'Newsletter section hidden')
        } catch (error) {
            toast.error('Failed')
        }
    }

    const handleDelete = async (sub) => {
        if (!confirm(`Remove ${sub.email} from subscribers?`)) return
        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sub.id }),
            })
            if (!res.ok) throw new Error('Failed')
            setSubscribers(prev => prev.filter(s => s.id !== sub.id))
            toast.success('Subscriber removed')
        } catch (error) {
            toast.error('Failed to remove')
        }
    }

    useEffect(() => {
        fetchNewsletter()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">Newsletter <span className="text-slate-800 font-medium">Management</span></h1>
            <p className="text-sm text-slate-400 mt-1">Manage the newsletter subscription section and subscriber list.</p>

            {/* Settings */}
            <form onSubmit={saveSettings} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-2xl flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Newsletter Section (homepage)</h3>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.active} onChange={toggleActive} className="accent-green-500" />
                    <span className="text-sm">Show newsletter section on homepage</span>
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Title</span>
                    <input value={settings.title || ''} onChange={(e) => setSettings({ ...settings, title: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Description</span>
                    <textarea value={settings.description || ''} onChange={(e) => setSettings({ ...settings, description: e.target.value })} rows={2} className="border border-slate-200 rounded p-2 text-sm resize-none" />
                </label>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Settings</button>
            </form>

            {/* Subscribers */}
            <div className="mt-8 max-w-3xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="font-medium text-slate-700">Subscribers ({subscribers.length})</h3>
                    <form onSubmit={(e) => { e.preventDefault(); fetchNewsletter() }} className="flex gap-2">
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email" className="border border-slate-200 outline-slate-400 p-2 rounded text-sm w-60" />
                        <button className="bg-slate-700 text-white px-4 rounded text-sm">Search</button>
                    </form>
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Subscribed At</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subscribers.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <MailIcon size={16} className="text-slate-400" />
                                            <span className="text-slate-700">{sub.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(sub.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => handleDelete(sub)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && (
                                <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No subscribers yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
