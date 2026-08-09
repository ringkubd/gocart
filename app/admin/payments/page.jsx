'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

const gatewayInfo = {
    bkash: { desc: 'bKash Merchant API — app_key + app_secret (sandbox/live).', extra: { username: '', password: '' } },
    nagad: { desc: 'Nagad Merchant API — merchant_id + public_key + private_key.', extra: { merchantId: '', publicKey: '', privateKey: '' } },
    sslcommerz: { desc: 'SSLCommerz — store_id + store_passwd (test/live).', extra: {} },
}

export default function AdminPayments() {

    const [gateways, setGateways] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({})

    const fetchGateways = async () => {
        try {
            const res = await fetch('/api/admin/payments')
            const data = await res.json()
            if (res.ok) setGateways(data.gateways)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateGateway = async (gateway) => {
        try {
            const res = await fetch('/api/admin/payments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gateway),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Payment settings saved')
            fetchGateways()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
        fetchGateways()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">Payment <span className="text-slate-800 font-medium">Gateways</span></h1>
            <p className="text-sm text-slate-400 mt-1">Configure payment providers. Activate any gateway anytime — checkout updates automatically.</p>

            <div className="mt-6 flex flex-col gap-4 max-w-3xl">
                {gateways.map((gateway) => {
                    const info = gatewayInfo[gateway.code] || { desc: '', extra: {} }
                    const gwForm = form[gateway.id] || {}
                    return (
                        <div key={gateway.id} className="border border-slate-200 rounded-xl p-6">
                            <div className="flex items-center justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-semibold text-slate-700 text-lg">{gateway.name}</p>
                                    <p className="text-xs text-slate-400">{info.desc}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select value={gwForm.mode ?? gateway.mode} onChange={(e) => setForm(f => ({ ...f, [gateway.id]: { ...f[gateway.id], mode: e.target.value } }))} className="border border-slate-200 rounded p-1.5 text-xs">
                                        <option value="sandbox">Sandbox</option>
                                        <option value="live">Live</option>
                                    </select>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" onChange={() => updateGateway({ id: gateway.id, active: !gateway.active })} checked={gateway.active} />
                                        <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                        <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">API Key / App Key / Store ID</span>
                                    <input value={gwForm.apiKey ?? gateway.apiKey} onChange={(e) => setForm(f => ({ ...f, [gateway.id]: { ...f[gateway.id], apiKey: e.target.value } }))} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">API Secret / Pass</span>
                                    <input type="password" value={gwForm.apiSecret ?? gateway.apiSecret} onChange={(e) => setForm(f => ({ ...f, [gateway.id]: { ...f[gateway.id], apiSecret: e.target.value } }))} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                {gateway.code === 'sslcommerz' && (
                                    <label className="flex flex-col gap-1 col-span-2">
                                        <span className="text-xs text-slate-400">Store ID</span>
                                        <input value={gwForm.storeId ?? gateway.storeId} onChange={(e) => setForm(f => ({ ...f, [gateway.id]: { ...f[gateway.id], storeId: e.target.value } }))} className="border border-slate-200 rounded p-2 text-sm" />
                                    </label>
                                )}
                                {gateway.code === 'nagad' && (
                                    <>
                                        <label className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Merchant ID</span>
                                            <input value={((gwForm.merchantId ?? (gateway.extra?.merchantId || '')))} onChange={(e) => setForm(f => ({ ...f, [gateway.id]: { ...f[gateway.id], merchantId: e.target.value } }))} className="border border-slate-200 rounded p-2 text-sm" />
                                        </label>
                                        <label className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400">Public Key</span>
                                            <input type="password" value={((gwForm.publicKey ?? (gateway.extra?.publicKey || '')))} onChange={(e) => setForm(f => ({ ...f, [gateway.id]: { ...f[gateway.id], publicKey: e.target.value } }))} className="border border-slate-200 rounded p-2 text-sm" />
                                        </label>
                                        <label className="flex flex-col gap-1 col-span-2">
                                            <span className="text-xs text-slate-400">Private Key</span>
                                            <input type="password" value={((gwForm.privateKey ?? (gateway.extra?.privateKey || '')))} onChange={(e) => setForm(f => ({ ...f, [gateway.id]: { ...f[gateway.id], privateKey: e.target.value } }))} className="border border-slate-200 rounded p-2 text-sm" />
                                        </label>
                                    </>
                                )}
                            </div>

                            <button onClick={() => updateGateway({ id: gateway.id, mode: gwForm.mode ?? gateway.mode, apiKey: gwForm.apiKey ?? gateway.apiKey, apiSecret: gwForm.apiSecret ?? gateway.apiSecret, storeId: gwForm.storeId ?? gateway.storeId, extra: { ...gateway.extra, merchantId: (gwForm.merchantId ?? (gateway.extra?.merchantId || '')), publicKey: (gwForm.publicKey ?? (gateway.extra?.publicKey || '')), privateKey: (gwForm.privateKey ?? (gateway.extra?.privateKey || '')) } })} className="mt-4 bg-slate-800 text-white px-6 py-2 rounded text-sm hover:bg-slate-900">
                                Save {gateway.name} Settings
                            </button>                        </div>
                    )
                })}
            </div>
        </div>
    )
}
