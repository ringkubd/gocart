'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

const statusColors = {
    ORDER_PLACED: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {

    const { symbol: currency } = useCurrency()
    const { t } = useLanguage()

    const statusLabels = {
        ORDER_PLACED: t('orderPlaced'),
        PROCESSING: t('processing'),
        SHIPPED: t('shipped'),
        DELIVERED: t('delivered'),
        CANCELLED: t('cancelled'),
    }

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [search, setSearch] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = async (status = filter, searchTerm = search) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (status) params.set('status', status)
            if (searchTerm) params.set('search', searchTerm)
            const res = await fetch(`/api/admin/orders?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                setOrders(data.orders)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateOrder = async (orderId, payload) => {
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update')
            }
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data.order } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(data.order)
            }
            return true
        } catch (error) {
            toast.error(error.message || 'Failed to update')
            return false
        }
    }

    const handleStatusChange = async (orderId, status) => {
        const ok = await updateOrder(orderId, { status })
        if (ok) toast.success(t('orderUpdated'))
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    useEffect(() => {
        fetchOrders(filter, search)
    }, [filter])

    if (loading && orders.length === 0) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl">{t('orderManagement')}</h1>
                <form onSubmit={(e) => { e.preventDefault(); fetchOrders(filter, search) }} className="flex gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search')} className="border border-slate-200 outline-slate-400 p-2 rounded text-sm w-60" />
                    <button className="bg-slate-700 text-white px-4 rounded text-sm">{t('search')}</button>
                </form>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-5">
                <button onClick={() => setFilter('')} className={`px-4 py-1.5 rounded-full text-sm border ${filter === '' ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>All</button>
                {Object.keys(statusLabels).map((s) => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm border ${filter === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{statusLabels[s]}</button>
                ))}
            </div>

            {/* Orders table */}
            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 max-w-6xl">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">{t('orders')}</th>
                            <th className="px-4 py-3">{t('customer')}</th>
                            <th className="px-4 py-3">{t('store')}</th>
                            <th className="px-4 py-3">{t('total')}</th>
                            <th className="px-4 py-3">{t('paymentMethod')}</th>
                            <th className="px-4 py-3">{t('tracking')}</th>
                            <th className="px-4 py-3">{t('status')}</th>
                            <th className="px-4 py-3">{t('date')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map((order) => (
                            <tr key={order.id} onClick={() => openModal(order)} className="hover:bg-slate-50 cursor-pointer">
                                <td className="px-4 py-3 font-mono text-xs text-green-600">#{order.id.slice(-8)}</td>
                                <td className="px-4 py-3">{order.user?.name}</td>
                                <td className="px-4 py-3">{order.store?.name}</td>
                                <td className="px-4 py-3 font-medium text-slate-800">{currency}{order.total}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-3 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{order.paymentMethod}{order.isPaid ? '' : ' (' + t('cashOnDelivery') + ')'}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">{order.trackingNumber || '—'}</td>
                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="border border-slate-300 rounded text-sm p-1">
                                        {Object.keys(statusLabels).map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">{t('noOrdersYet')}.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order detail modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            Order #{selectedOrder.id.slice(-8)}
                        </h2>

                        {/* Customer */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">{t('customerDetails')}</h3>
                            <p><span className="text-green-700">Name:</span> {selectedOrder.user?.name}</p>
                            <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email}</p>
                            <p><span className="text-green-700">Phone:</span> {selectedOrder.address?.phone}</p>
                            <p><span className="text-green-700">Address:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">{t('products')}</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                                        <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-16 h-16 object-cover rounded" />
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name}</p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: {currency}{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery management */}
                        <div className="mb-4 border border-slate-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">{t('deliveryTracking')}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">{t('courierName')}</span>
                                    <input defaultValue={selectedOrder.courierName} id="courierName" className="border border-slate-200 rounded p-2 text-sm" placeholder="e.g. Pathao, Steadfast" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">{t('trackingNumber')}</span>
                                    <input defaultValue={selectedOrder.trackingNumber} id="trackingNumber" className="border border-slate-200 rounded p-2 text-sm" placeholder="Tracking no." />
                                </label>
                            </div>
                            <label className="flex flex-col gap-1 mt-3">
                                <span className="text-xs text-slate-400">{t('internalNote')}</span>
                                <input defaultValue={selectedOrder.note} id="note" className="border border-slate-200 rounded p-2 text-sm" placeholder="Optional note" />
                            </label>
                            <div className="flex gap-2 mt-4">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked={selectedOrder.isPaid} id="isPaid" className="accent-green-500" />
                                    <span className="text-sm">{t('paymentReceived')}</span>
                                </label>
                            </div>
                            <button
                                onClick={async () => {
                                    const ok = await updateOrder(selectedOrder.id, {
                                        courierName: document.getElementById('courierName').value,
                                        trackingNumber: document.getElementById('trackingNumber').value,
                                        note: document.getElementById('note').value,
                                        isPaid: document.getElementById('isPaid').checked,
                                    })
                                    if (ok) toast.success('Delivery info saved')
                                }}
                                className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 text-sm"
                            >
                                Save Delivery Info
                            </button>
                        </div>

                        {/* Payment & status */}
                        <div className="mb-4">
                            <p><span className="text-green-700">Shipping:</span> {selectedOrder.shippingMethod} ({currency}{selectedOrder.shippingCost})</p>
                            <p><span className="text-green-700">{t('paymentMethodLabel')}:</span> {selectedOrder.paymentMethod} — {selectedOrder.isPaid ? t('paidLabel') : t('unpaidLabel')}</p>
                            {selectedOrder.transactionId && <p><span className="text-green-700">Txn ID:</span> {selectedOrder.transactionId}</p>}
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700">Coupon:</span> {selectedOrder.coupon?.code} ({selectedOrder.coupon?.discount}% off)</p>
                            )}
                            <p><span className="text-green-700">Status:</span> <span className={`text-xs px-3 py-1 rounded-full ${statusColors[selectedOrder.status]}`}>{statusLabels[selectedOrder.status]}</span></p>
                            {selectedOrder.shippedAt && <p><span className="text-green-700">Shipped at:</span> {new Date(selectedOrder.shippedAt).toLocaleString()}</p>}
                            {selectedOrder.deliveredAt && <p><span className="text-green-700">Delivered at:</span> {new Date(selectedOrder.deliveredAt).toLocaleString()}</p>}
                            <p><span className="text-green-700">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">{t('close')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
