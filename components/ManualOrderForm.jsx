'use client'
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useCurrency } from "./useCurrency"

const SOURCES = ["PHONE", "MESSENGER", "WHATSAPP", "IMO", "IN_PERSON", "OTHER"]
const PAYMENTS = ["COD", "BKASH", "NAGAD", "SSLCOM", "OTHER"]
const STATUSES = ["ORDER_PLACED", "PROCESSING"]

const isFreeProduct = (p) => p?.freeDelivery || Number(p?.deliveryCost || 0) <= 0

export default function ManualOrderForm({ mode, submitUrl, onCreated }) {
    const { format } = useCurrency()
    const isAdmin = mode === "admin"

    const [stores, setStores] = useState([])
    const [storeId, setStoreId] = useState("")
    const [storeProducts, setStoreProducts] = useState([])

    const [customer, setCustomer] = useState({ name: "", phone: "", email: "" })
    const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "", country: "Bangladesh" })

    const [query, setQuery] = useState("")
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [variantPick, setVariantPick] = useState({})

    const [items, setItems] = useState([])
    const [shippingMethods, setShippingMethods] = useState([])
    const [shippingMethodId, setShippingMethodId] = useState("")
    const [manualShipping, setManualShipping] = useState("")
    const [couponCode, setCouponCode] = useState("")
    const [manualDiscount, setManualDiscount] = useState("")

    const [paymentMethod, setPaymentMethod] = useState("COD")
    const [isPaid, setIsPaid] = useState(false)
    const [transactionId, setTransactionId] = useState("")
    const [status, setStatus] = useState("ORDER_PLACED")
    const [source, setSource] = useState("PHONE")
    const [customerNote, setCustomerNote] = useState("")
    const [note, setNote] = useState("")
    const [placing, setPlacing] = useState(false)

    // Stores (admin) + shipping methods
    useEffect(() => {
        if (isAdmin) {
            fetch("/api/admin/stores").then(r => r.json()).then(d => {
                if (d.stores) setStores(d.stores)
            }).catch(() => {})
        }
        fetch("/api/settings").then(r => r.json()).then(d => {
            if (d.shippingMethods) setShippingMethods(d.shippingMethods)
        }).catch(() => {})
    }, [isAdmin])

    // Store products for store mode (one fetch, client filter)
    useEffect(() => {
        if (!isAdmin) {
            fetch("/api/store/dashboard").then(r => r.json()).then(d => {
                if (d.products) setStoreProducts(d.products.map(p => ({ ...p, options: Array.isArray(p.options) ? p.options : [] })))
            }).catch(() => {})
        }
    }, [isAdmin])

    // Admin product search (debounced)
    useEffect(() => {
        if (!isAdmin) return
        if (!storeId || query.trim().length < 2) { setResults([]); return }
        setSearching(true)
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/admin/products?search=${encodeURIComponent(query.trim())}&storeId=${storeId}&pageSize=10`)
                const data = await res.json()
                if (res.ok) setResults(data.products || [])
            } catch (e) {} finally { setSearching(false) }
        }, 350)
        return () => clearTimeout(t)
    }, [query, storeId, isAdmin])

    const storeFiltered = useMemo(() => {
        if (isAdmin) return []
        const q = query.trim().toLowerCase()
        if (q.length < 2) return []
        return storeProducts.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 10)
    }, [query, storeProducts, isAdmin])

    const searchResults = isAdmin ? results : storeFiltered

    const addItem = (product, variantId, qty = 1, priceOverride) => {
        const variant = variantId ? product.variants?.find(v => v.id === variantId) : null
        if (product.hasVariants && !variant) {
            toast.error("Select a variant first")
            return
        }
        const unitPrice = priceOverride !== undefined ? Number(priceOverride) : (variant ? variant.price : product.price)
        const key = variant ? `${product.id}:${variant.id}` : product.id
        setItems(prev => {
            const existing = prev.find(i => i.key === key)
            if (existing) {
                return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + qty } : i)
            }
            return [...prev, {
                key,
                productId: product.id,
                productName: product.name,
                variantId: variant?.id || null,
                variantLabel: variant ? Object.values(variant.attributes || {}).join(" / ") : "",
                quantity: qty,
                unitPrice,
                freeDelivery: product.freeDelivery,
                deliveryCost: product.deliveryCost || 0,
                minQtyForFree: product.minQtyForFree || 0,
                deliveryDiscount: product.deliveryDiscount || 0,
            }]
        })
    }

    const totals = useMemo(() => {
        const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
        const disc = Math.max(0, Math.min(Number(manualDiscount) || 0, subtotal))
        const freeAll = items.length > 0 && items.every(i => i.freeDelivery || Number(i.deliveryCost || 0) <= 0)
        const method = shippingMethods.find(m => m.id === shippingMethodId)
        let ship = manualShipping !== "" ? Math.max(0, Number(manualShipping) || 0) : (method ? method.cost : 0)
        if (freeAll) ship = 0
        let prodDel = 0
        if (!freeAll) {
            for (const i of items) {
                if (i.freeDelivery || Number(i.deliveryCost || 0) <= 0) continue
                let d = Number(i.deliveryCost || 0) * i.quantity
                if (i.minQtyForFree > 0 && i.quantity >= i.minQtyForFree) d = 0
                if (i.deliveryDiscount > 0) d = d * (1 - i.deliveryDiscount / 100)
                prodDel += d
            }
        }
        return { subtotal, disc, ship, prodDel, total: Math.max(0, subtotal - disc + ship + prodDel) }
    }, [items, manualDiscount, manualShipping, shippingMethodId, shippingMethods])

    const submit = async (e) => {
        e.preventDefault()
        if (placing) return
        if (isAdmin && !storeId) { toast.error("Select a store"); return }
        if (!customer.name.trim() || !customer.phone.trim()) { toast.error("Customer name and phone are required"); return }
        if (!address.street.trim() || !address.city.trim() || !address.state.trim() || !address.zip.trim()) { toast.error("Full delivery address is required"); return }
        if (!items.length) { toast.error("Add at least one product"); return }
        setPlacing(true)
        try {
            const res = await fetch(submitUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: isAdmin ? storeId : undefined,
                    items: items.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity, price: i.unitPrice })),
                    customer,
                    address,
                    paymentMethod,
                    isPaid,
                    transactionId,
                    couponCode: couponCode.trim(),
                    manualDiscount: Number(manualDiscount) || 0,
                    shippingMethodId,
                    manualShippingCost: manualShipping === "" ? undefined : Number(manualShipping),
                    status,
                    source,
                    customerNote,
                    note,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to create order")
            toast.success(`Order ${data.order.orderNumber || ""} created`)
            onCreated?.(data.order)
        } catch (error) {
            toast.error(error.message || "Failed")
        } finally {
            setPlacing(false)
        }
    }

    const inputCls = "border border-slate-200 rounded p-2 text-sm outline-none focus:border-slate-400 w-full"

    return (
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl text-slate-700 text-sm">
            <div className="lg:col-span-2 flex flex-col gap-6">
                {isAdmin && (
                    <div className="border border-slate-200 rounded-xl p-5">
                        <h3 className="font-medium mb-3">Store</h3>
                        <select value={storeId} onChange={(e) => { setStoreId(e.target.value); setItems([]); setQuery(""); setResults([]) }} className={inputCls} required>
                            <option value="">Select store</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name} (@{s.username})</option>)}
                        </select>
                    </div>
                )}

                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-medium mb-3">Customer (phone / messenger buyer)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Full name *" className={inputCls} required />
                        <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="Phone *" className={inputCls} required />
                        <input value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="Email (optional)" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Street / House *" className={inputCls} required />
                        <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City *" className={inputCls} required />
                        <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="Division *" className={inputCls} required />
                        <input value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} placeholder="Post Code *" className={inputCls} required />
                    </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-medium mb-3">Products</h3>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isAdmin ? (storeId ? "Type 2+ letters to search products..." : "Select a store first") : "Type 2+ letters to search your products..."} disabled={isAdmin && !storeId} className={inputCls} />
                    {searching && <p className="text-xs text-slate-400 mt-2">Searching...</p>}
                    {searchResults.length > 0 && (
                        <div className="mt-3 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto">
                            {searchResults.map(p => (
                                <div key={p.id} className="p-3 flex flex-wrap items-center gap-3">
                                    <div className="flex-1 min-w-40">
                                        <p className="font-medium text-slate-700">{p.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {p.hasVariants && p.variants?.length ? `${p.variants.length} variants` : `${format(p.price)} · Stock: ${p.stock}`}
                                        </p>
                                    </div>
                                    {p.hasVariants && p.variants?.length > 0 ? (
                                        <select value={variantPick[p.id] || ""} onChange={(e) => setVariantPick({ ...variantPick, [p.id]: e.target.value })} className="border border-slate-200 rounded p-2 text-xs max-w-52">
                                            <option value="">Select variant</option>
                                            {p.variants.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {Object.values(v.attributes || {}).join(" / ")} — {format(v.price)} (Stock {v.stock})
                                                </option>
                                            ))}
                                        </select>
                                    ) : null}
                                    <button type="button" onClick={() => addItem(p, p.hasVariants ? (variantPick[p.id] || "") : null)} className="bg-slate-800 text-white px-4 py-2 rounded text-xs hover:bg-slate-900">Add</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {items.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-left text-slate-400 uppercase">
                                        <th className="py-2">Item</th>
                                        <th className="py-2 w-20">Qty</th>
                                        <th className="py-2 w-28">Unit price</th>
                                        <th className="py-2 text-right w-24">Total</th>
                                        <th className="py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map((i) => (
                                        <tr key={i.key}>
                                            <td className="py-2 pr-2">
                                                <p className="font-medium">{i.productName}</p>
                                                {i.variantLabel && <p className="text-slate-400">{i.variantLabel}</p>}
                                            </td>
                                            <td className="py-2">
                                                <input type="number" min={1} value={i.quantity} onChange={(e) => setItems(prev => prev.map(x => x.key === i.key ? { ...x, quantity: Math.max(1, Number(e.target.value) || 1) } : x))} className="border border-slate-200 rounded p-1.5 w-16 text-xs" />
                                            </td>
                                            <td className="py-2">
                                                <input type="number" min={0} value={i.unitPrice} onChange={(e) => setItems(prev => prev.map(x => x.key === i.key ? { ...x, unitPrice: Math.max(0, Number(e.target.value) || 0) } : x))} className="border border-slate-200 rounded p-1.5 w-24 text-xs" />
                                            </td>
                                            <td className="py-2 text-right font-medium">{format(i.unitPrice * i.quantity)}</td>
                                            <td className="py-2 text-right">
                                                <button type="button" onClick={() => setItems(prev => prev.filter(x => x.key !== i.key))} className="text-red-500 hover:text-red-700 px-2">✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-medium mb-3">Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="Customer note (e.g. called from 01XXXXXXXXX)" rows={2} className={inputCls} />
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (only staff)" rows={2} className={inputCls} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-medium mb-3">Order source</h3>
                    <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
                        {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="mt-3">
                        <span className="text-xs text-slate-400">Initial status</span>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} mt-1`}>
                            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-medium mb-3">Payment</h3>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
                        {PAYMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <label className="flex items-center gap-2 mt-3 text-xs">
                        <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="accent-green-500" />
                        Payment received
                    </label>
                    <input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Transaction ID (optional)" className={`${inputCls} mt-3`} />
                </div>

                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-medium mb-3">Shipping & discount</h3>
                    <span className="text-xs text-slate-400">Shipping method</span>
                    <select value={shippingMethodId} onChange={(e) => setShippingMethodId(e.target.value)} className={`${inputCls} mt-1`}>
                        <option value="">No shipping method</option>
                        {shippingMethods.map(m => <option key={m.id} value={m.id}>{m.name} — {m.cost > 0 ? format(m.cost) : "Free"}</option>)}
                    </select>
                    <input value={manualShipping} onChange={(e) => setManualShipping(e.target.value)} type="number" min={0} placeholder="Manual shipping cost override (optional)" className={`${inputCls} mt-3`} />
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code (optional)" className={`${inputCls} mt-3`} />
                    <input value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} type="number" min={0} placeholder="Manual discount amount (optional)" className={`${inputCls} mt-3`} />
                </div>

                <div className="border border-slate-200 rounded-xl p-5">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>{format(totals.subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Manual discount</span><span>-{format(totals.disc)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Shipping</span><span>{totals.ship > 0 ? format(totals.ship) : "Free"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Product delivery</span><span>{totals.prodDel > 0 ? format(totals.prodDel) : "Free"}</span></div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-semibold text-slate-800"><span>Total</span><span>{format(totals.total)}</span></div>
                    </div>
                    <button disabled={placing} className="mt-4 w-full bg-slate-800 text-white py-2.5 rounded hover:bg-slate-900 disabled:opacity-50 text-sm">
                        {placing ? "Placing order..." : "Place order"}
                    </button>
                </div>
            </div>
        </form>
    )
}
