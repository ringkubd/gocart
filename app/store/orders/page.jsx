'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"
import GuestBadge from "@/components/GuestBadge"
import useStorefrontData from "@/components/useStorefrontData"

const statusColors = {
    ORDER_PLACED: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

export default function StoreOrders() {
    const { format } = useCurrency()
    const { t } = useLanguage()
    const { couriers } = useStorefrontData()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const statusLabels = {
        ORDER_PLACED: 'Order Placed', PROCESSING: 'Processing', SHIPPED: 'Shipped',
        DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
    }

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/store/orders')
            const data = await res.json()
            if (res.ok) setOrders(data.orders)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update')
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data.order } : o))
            if (selectedOrder?.id === orderId) setSelectedOrder(data.order)
            toast.success('Status updated')
        } catch (error) { toast.error(error.message || 'Failed to update') }
    }

    const saveTracking = async (orderId) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courierName: document.getElementById('store-courier').value,
                    trackingNumber: document.getElementById('store-tracking').value,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to save tracking')
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data.order } : o))
            if (selectedOrder?.id === orderId) setSelectedOrder(data.order)
            toast.success(t('saveTracking'))
        } catch (error) { toast.error(error.message || 'Failed to save tracking') }
    }

    const openModal = (order) => { setSelectedOrder(order); setIsModalOpen(true) }
    const closeModal = () => { setSelectedOrder(null); setIsModalOpen(false) }

    useEffect(() => { fetchOrders() }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">{t('orderManagement')}</h1>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div className="overflow-x-auto max-w-5xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                {["Sr. No.", "Customer", "Total", "Payment", "Coupon", "Status", "Date"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr key={order.id} onClick={() => openModal(order)} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                                    <td className="pl-6 text-green-600">{index + 1}</td>
                                    <td className="px-4 py-3">{order.user?.name}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{format(order.total)}</td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3">{order.isCouponUsed ? <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{order.coupon?.code}</span> : "—"}</td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} className="border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200">
                                            {Object.keys(statusLabels).map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Modal — matches admin layout exactly */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            {t('orderDetails')} — {selectedOrder.orderNumber || selectedOrder.id.slice(-8)}
                        </h2>

                        {/* Customer Details */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">{t('customerDetails')}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-green-700">{t('name')}:</span>
                                <span>{selectedOrder.guestName || selectedOrder.user?.name || 'Guest'}</span>
                                <GuestBadge order={selectedOrder} />
                            </div>
                            <p><span className="text-green-700">{t('email')}:</span> {selectedOrder.user?.email || selectedOrder.guestEmail || selectedOrder.address?.email}</p>
                            <p><span className="text-green-700">{t('phone')}:</span> {selectedOrder.address?.phone}</p>
                            <p><span className="text-green-700">{t('address')}:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">{t('products')}</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                                        <img src={item.product.images?.[0]} alt={item.product?.name} className="w-16 h-16 object-cover rounded" />
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name}</p>
                                            <p>{t('quantityLabel')}: {item.quantity}</p>
                                            <p>{t('price')}: {format(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Tracking */}
                        <div className="mb-4 border border-slate-200 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">{t('deliveryTracking')}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">{t('courierName')}</span>
                                    <select defaultValue={selectedOrder.courierName} id="store-courier" className="border border-slate-200 rounded p-2 text-sm">
                                        <option value="">{t('selectCourier')}</option>
                                        {(couriers || []).map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                                        {selectedOrder.courierName && !(couriers || []).some(c => c.name === selectedOrder.courierName) && (
                                            <option value={selectedOrder.courierName}>{selectedOrder.courierName}</option>
                                        )}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">{t('trackingNumber')}</span>
                                    <input defaultValue={selectedOrder.trackingNumber} id="store-tracking" className="border border-slate-200 rounded p-2 text-sm" placeholder="Tracking no." />
                                </label>
                            </div>
                            <button onClick={() => saveTracking(selectedOrder.id)} className="mt-3 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 text-sm">
                                {t('saveTracking')}
                            </button>
                        </div>

                        {/* Payment & Status */}
                        <div className="mb-4">
                            <p><span className="text-green-700">{t('paymentMethodLabel')}:</span> {selectedOrder.paymentMethod} — {selectedOrder.isPaid ? t('paidLabel') : t('unpaidLabel')}</p>
                            {selectedOrder.transactionId && <p><span className="text-green-700">Txn ID:</span> {selectedOrder.transactionId}</p>}
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700">{t('coupon')}:</span> {selectedOrder.coupon?.code} ({selectedOrder.coupon?.discount}% off)</p>
                            )}
                            <p><span className="text-green-700">Shipping:</span> {selectedOrder.shippingMethod} ({format(selectedOrder.shippingCost)})</p>
                            <p><span className="text-green-700">{t('status')}:</span> <span className={`text-xs px-3 py-1 rounded-full ${statusColors[selectedOrder.status]}`}>{statusLabels[selectedOrder.status]}</span></p>
                            {selectedOrder.shippedAt && <p><span className="text-green-700">{t('shippedAt')}:</span> {new Date(selectedOrder.shippedAt).toLocaleString()}</p>}
                            {selectedOrder.deliveredAt && <p><span className="text-green-700">{t('deliveredAt')}:</span> {new Date(selectedOrder.deliveredAt).toLocaleString()}</p>}
                            <p><span className="text-green-700">{t('orderDate')}:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">{t('close')}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
