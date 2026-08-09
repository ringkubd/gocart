'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const courierInfo = {
    pathao: { desc: 'Pathao Courier (Bangladesh) — uses client_id/client_secret/token grant.', fields: ['apiKey', 'apiSecret'] },
    redx: { desc: 'RedX Logistics — API key based.', fields: ['apiKey', 'apiSecret'] },
    steadfast: { desc: 'Steadfast Courier — api_key + secret_key.', fields: ['apiKey', 'apiSecret'] },
    paperfly: { desc: 'Paperfly — token based.', fields: ['apiKey', 'apiSecret'] },
    ecourier: { desc: 'eCourier — key/secret based.', fields: ['apiKey', 'apiSecret'] },
}

export default function AdminCouriers() {

    const [providers, setProviders] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({})

    const fetchProviders = async () => {
        try {
            const res = await fetch('/api/admin/couriers')
            const data = await res.json()
            if (res.ok) setProviders(data.providers)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateProvider = async (provider) => {
        try {
            const res = await fetch('/api/admin/couriers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(provider),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Courier settings saved')
            fetchProviders()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
        fetchProviders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">Courier <span className="text-slate-800 font-medium">Integrations</span></h1>
            <p className="text-sm text-slate-400 mt-1">Save API keys for delivery providers. Activate any courier anytime from here — no code changes needed.</p>

            <div className="mt-6 flex flex-col gap-4 max-w-3xl">
                {providers.map((provider) => {
                    const info = courierInfo[provider.code] || { desc: '', fields: ['apiKey', 'apiSecret'] }
                    return (
                        <div key={provider.id} className="border border-slate-200 rounded-xl p-6">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-semibold text-slate-700 text-lg">{provider.name}</p>
                                    <p className="text-xs text-slate-400">{info.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => updateProvider({ id: provider.id, active: !provider.active })} checked={provider.active} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {info.fields.includes('apiKey') && (
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">API Key / Client ID</span>
                                        <input type="password" value={provider.apiKey} onChange={(e) => setForm(f => ({ ...f, [provider.id]: { ...f[provider.id], apiKey: e.target.value } }))} placeholder="••••••••" className="border border-slate-200 rounded p-2 text-sm" />
                                    </label>
                                )}
                                {info.fields.includes('apiSecret') && (
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">API Secret / Token</span>
                                        <input type="password" value={provider.apiSecret} onChange={(e) => setForm(f => ({ ...f, [provider.id]: { ...f[provider.id], apiSecret: e.target.value } }))} placeholder="••••••••" className="border border-slate-200 rounded p-2 text-sm" />
                                    </label>
                                )}
                                <label className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-slate-400">Base URL (optional, default provided)</span>
                                    <input value={provider.baseUrl} onChange={(e) => setForm(f => ({ ...f, [provider.id]: { ...f[provider.id], baseUrl: e.target.value } }))} placeholder="https://..." className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                            </div>

                            <button onClick={() => updateProvider({ id: provider.id, ...form[provider.id] })} className="mt-4 bg-slate-800 text-white px-6 py-2 rounded text-sm hover:bg-slate-900">
                                Save {provider.name} Settings
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
