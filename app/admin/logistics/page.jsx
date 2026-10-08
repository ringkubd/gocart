'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { TruckIcon, RotateCcwIcon, BanknoteIcon, MapPinIcon, ShieldAlertIcon, RefreshCwIcon } from "lucide-react"

const TABS = [
    { key: 'overview', label: 'Overview', icon: TruckIcon },
    { key: 'returns', label: 'Returns', icon: RotateCcwIcon },
    { key: 'payments', label: 'Payments', icon: BanknoteIcon },
    { key: 'stations', label: 'Police Stations', icon: MapPinIcon },
    { key: 'fraud', label: 'Fraud Check', icon: ShieldAlertIcon },
]

export default function AdminLogistics() {
    const [tab, setTab] = useState('overview')
    const [loading, setLoading] = useState(true)

    const [overview, setOverview] = useState(null)
    const [returns, setReturns] = useState([])
    const [returnsLoading, setReturnsLoading] = useState(false)
    const [payments, setPayments] = useState([])
    const [paymentsLoading, setPaymentsLoading] = useState(false)
    const [paymentDetail, setPaymentDetail] = useState(null)
    const [stations, setStations] = useState([])
    const [stationsLoading, setStationsLoading] = useState(false)
    const [stationQuery, setStationQuery] = useState('')
    const [phone, setPhone] = useState('')
    const [fraud, setFraud] = useState(null)
    const [fraudLoading, setFraudLoading] = useState(false)

    const loadOverview = async () => {
        try {
            const res = await fetch('/api/admin/logistics/overview')
            const data = await res.json()
            if (res.ok) setOverview(data)
        } catch (e) {} finally { setLoading(false) }
    }

    const loadReturns = async () => {
        setReturnsLoading(true)
        try {
            const res = await fetch('/api/admin/logistics/returns')
            const data = await res.json()
            setReturns(data.returns || [])
            if (data.error) toast.error(data.error)
        } catch (e) { toast.error('Failed') } finally { setReturnsLoading(false) }
    }

    const loadPayments = async () => {
        setPaymentsLoading(true)
        try {
            const res = await fetch('/api/admin/logistics/payments')
            const data = await res.json()
            setPayments(data.payments || [])
            if (data.error) toast.error(data.error)
        } catch (e) { toast.error('Failed') } finally { setPaymentsLoading(false) }
    }

    const loadPayment = async (id) => {
        try {
            const res = await fetch(`/api/admin/logistics/payments?id=${id}`)
            const data = await res.json()
            setPaymentDetail(data.payment || null)
        } catch (e) { toast.error('Failed') }
    }

    const loadStations = async () => {
        setStationsLoading(true)
        try {
            const res = await fetch('/api/admin/logistics/police-stations')
            const data = await res.json()
            setStations(data.stations || [])
            if (data.error) toast.error(data.error)
        } catch (e) { toast.error('Failed') } finally { setStationsLoading(false) }
    }

    const runFraudCheck = async (e) => {
        e.preventDefault()
        if (!phone.trim()) return
        setFraudLoading(true); setFraud(null)
        try {
            const res = await fetch('/api/admin/logistics/fraud-check', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            })
            const data = await res.json()
            if (data.error) toast.error(data.error)
            setFraud(data.result || null)
        } catch (e) { toast.error('Failed') } finally { setFraudLoading(false) }
    }

    useEffect(() => { loadOverview() }, [])
    useEffect(() => {
        if (tab === 'returns' && returns.length === 0) loadReturns()
        if (tab === 'payments' && payments.length === 0) loadPayments()
        if (tab === 'stations' && stations.length === 0) loadStations()
    }, [tab])

    const s = overview?.stats || {}
    const filteredStations = stationQuery.trim()
        ? stations.filter(st => JSON.stringify(st).toLowerCase().includes(stationQuery.toLowerCase()))
        : stations

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">Courier <span className="text-slate-800 font-medium">Dashboard</span></h1>
            <p className="text-sm text-slate-400 mt-1">Steadfast consignments, returns, payments, hub stations and fraud check.</p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-5 border-b border-slate-200">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-green-500 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {tab === 'overview' && (
                <div className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            ['Total orders', s.total],
                            ['Sent to Steadfast', s.sent],
                            ['In transit', s.inTransit],
                            ['Delivered', s.delivered],
                            ['Cancelled', s.cancelled],
                            ['Not sent yet', s.notSent],
                            ['Balance', overview?.balance != null ? `৳${overview.balance}` : '—'],
                        ].map(([label, val], i) => (
                            <div key={i} className="border border-slate-200 rounded-xl p-4">
                                <p className="text-xs text-slate-400 mb-1">{label}</p>
                                <p className="text-2xl font-semibold text-slate-800">{val ?? '—'}</p>
                            </div>
                        ))}
                        <button onClick={loadOverview} className="border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-slate-50">
                            <RefreshCwIcon size={18} className="text-slate-500" />
                            <span className="text-xs text-slate-500 mt-1">Refresh</span>
                        </button>
                    </div>

                    <h3 className="font-medium text-slate-700 mt-8 mb-3">Recent consignments</h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200 max-w-5xl">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Order</th>
                                    <th className="px-4 py-3">Courier</th>
                                    <th className="px-4 py-3">Consignment</th>
                                    <th className="px-4 py-3">Tracking</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(overview?.recent || []).map(o => (
                                    <tr key={o.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-xs text-green-600">{o.orderNumber || o.id.slice(-8)}</td>
                                        <td className="px-4 py-3">{o.courierName || '—'}</td>
                                        <td className="px-4 py-3 text-xs">{o.courierConsignmentId || '—'}</td>
                                        <td className="px-4 py-3 text-xs">{o.trackingNumber || '—'}</td>
                                        <td className="px-4 py-3 text-xs">{o.status}</td>
                                        <td className="px-4 py-3 text-xs text-slate-400">{new Date(o.updatedAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(overview?.recent || []).length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No consignments yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* RETURNS */}
            {tab === 'returns' && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-slate-400">Return requests from Steadfast. Create new from an order's page.</p>
                        <button onClick={loadReturns} className="text-sm text-green-600 hover:underline flex items-center gap-1"><RefreshCwIcon size={14} /> Refresh</button>
                    </div>
                    {returnsLoading ? <Loading /> : (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 max-w-4xl">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Return ID</th>
                                        <th className="px-4 py-3">Consignment</th>
                                        <th className="px-4 py-3">Reason</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {returns.map((r, i) => (
                                        <tr key={r.id || i} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                                            <td className="px-4 py-3 text-xs">{r.consignment_id || '—'}</td>
                                            <td className="px-4 py-3 text-xs">{r.reason || '—'}</td>
                                            <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{r.status || '—'}</span></td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                                        </tr>
                                    ))}
                                    {returns.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No return requests.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* PAYMENTS */}
            {tab === 'payments' && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-slate-400">Steadfast payouts. Click a row to see its consignments.</p>
                        <button onClick={loadPayments} className="text-sm text-green-600 hover:underline flex items-center gap-1"><RefreshCwIcon size={14} /> Refresh</button>
                    </div>
                    <div className="flex gap-6 max-w-5xl">
                        <div className="flex-1 overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Payment ID</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paymentsLoading ? <tr><td colSpan={3} className="p-6"><Loading /></td></tr> : payments.map((p, i) => (
                                        <tr key={p.id || i} className="hover:bg-slate-50 cursor-pointer" onClick={() => loadPayment(p.payment_id || p.id)}>
                                            <td className="px-4 py-3 font-mono text-xs">{p.payment_id || p.id}</td>
                                            <td className="px-4 py-3 font-medium text-slate-800">{p.amount != null ? `৳${p.amount}` : '—'}</td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</td>
                                        </tr>
                                    ))}
                                    {!paymentsLoading && payments.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No payments.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        {paymentDetail && (
                            <div className="w-80 shrink-0 border border-slate-200 rounded-lg p-4 text-xs">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-slate-700">Payment #{paymentDetail.id}</p>
                                    <button onClick={() => setPaymentDetail(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                                </div>
                                <pre className="bg-slate-50 rounded p-2 overflow-auto max-h-96">{JSON.stringify(paymentDetail, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STATIONS */}
            {tab === 'stations' && (
                <div className="mt-6 max-w-3xl">
                    <input value={stationQuery} onChange={(e) => setStationQuery(e.target.value)} placeholder="Search police station / district..." className="border border-slate-200 rounded p-2 text-sm w-full mb-4" />
                    {stationsLoading ? <Loading /> : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {filteredStations.slice(0, 200).map((st, i) => (
                                <div key={i} className="border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
                                    {typeof st === 'string' ? st : st.name}
                                    {st.district && <span className="block text-xs text-slate-400">{st.district}</span>}
                                </div>
                            ))}
                            {filteredStations.length === 0 && <p className="text-slate-400 text-sm">No stations found.</p>}
                        </div>
                    )}
                </div>
            )}

            {/* FRAUD CHECK */}
            {tab === 'fraud' && (
                <div className="mt-6 max-w-xl">
                    <p className="text-sm text-slate-400 mb-3">Check a customer's delivery history across couriers before accepting a COD order.</p>
                    <form onSubmit={runFraudCheck} className="flex gap-2">
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Customer phone (11 digits)" className="border border-slate-200 rounded p-2 text-sm flex-1" />
                        <button className="bg-slate-800 text-white px-5 rounded text-sm hover:bg-slate-900">{fraudLoading ? 'Checking...' : 'Check'}</button>
                    </form>
                    {fraud && (
                        <div className="mt-4 border border-slate-200 rounded-xl p-4 text-sm">
                            {fraud.success === false ? (
                                <p className="text-slate-500">{fraud.message || 'No data available.'}</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div><p className="text-xs text-slate-400">Total orders</p><p className="text-lg font-semibold text-slate-800">{fraud.data?.total_orders ?? '—'}</p></div>
                                        <div><p className="text-xs text-slate-400">Delivered</p><p className="text-lg font-semibold text-green-700">{fraud.data?.total_delivered ?? '—'}</p></div>
                                        <div><p className="text-xs text-slate-400">Rate</p><p className="text-lg font-semibold text-slate-800">{fraud.data?.delivery_rate ?? '—'}</p></div>
                                    </div>
                                    <div className="space-y-1">
                                        {(fraud.data?.couriers || []).map((c, i) => (
                                            <div key={i} className="flex justify-between text-xs text-slate-500">
                                                <span>{c.courier_name}</span>
                                                <span>{c.orders} orders · {c.delivered} delivered · {c.delivery_rate}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
