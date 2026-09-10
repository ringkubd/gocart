'use client'
import { Fragment, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import { PlusIcon, ChevronDownIcon } from "lucide-react"
import { useCurrency } from "@/components/useCurrency"
import { useLanguage } from "@/components/LanguageProvider"

export default function StoreInventory() {
    const { format } = useCurrency()
    const { t } = useLanguage()

    const [inventory, setInventory] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [expanded, setExpanded] = useState(null)
    const [showAdd, setShowAdd] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ productId: "", variantId: "", supplier: "", quantity: "", unitCost: "", note: "" })

    const fetchInventory = async () => {
        try {
            const res = await fetch("/api/store/inventory")
            const data = await res.json()
            if (res.ok) setInventory(data.inventory)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchInventory() }, [])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return inventory
        return inventory.filter(p => p.name?.toLowerCase().includes(q))
    }, [inventory, search])

    const selectedProduct = inventory.find(p => p.id === form.productId)

    const handleAdd = async (e) => {
        e.preventDefault()
        if (saving) return
        setSaving(true)
        try {
            const res = await fetch("/api/store/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: form.productId,
                    variantId: form.variantId || null,
                    supplier: form.supplier,
                    quantity: Number(form.quantity),
                    unitCost: Number(form.unitCost) || 0,
                    note: form.note,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to add stock")
            toast.success("Stock added")
            setShowAdd(false)
            setForm({ productId: "", variantId: "", supplier: "", quantity: "", unitCost: "", note: "" })
            fetchInventory()
        } catch (error) {
            toast.error(error.message || "Failed")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl">Inventory</h1>
                    <p className="text-sm text-slate-400 mt-1">Kotha theke koto dam-e koto piece kinlen — hisab ekhane.</p>
                </div>
                <div className="flex gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product" className="border border-slate-200 p-2 rounded text-sm w-52" />
                    <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900">
                        <PlusIcon size={16} /> {showAdd ? "Cancel" : "Add Stock"}
                    </button>
                </div>
            </div>

            {showAdd && (
                <form onSubmit={handleAdd} className="border border-slate-200 rounded-xl p-6 mt-4 max-w-2xl flex flex-col gap-3 bg-slate-50/50">
                    <h3 className="font-medium text-slate-700">New Purchase (stock in)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 col-span-2">
                            <span className="text-xs text-slate-400">Product *</span>
                            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value, variantId: "" })} className="border border-slate-200 rounded p-2 text-sm bg-white" required>
                                <option value="">Select product</option>
                                {inventory.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.hasVariants ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : p.stock})</option>)}
                            </select>
                        </label>
                        {selectedProduct?.hasVariants && (
                            <label className="flex flex-col gap-1 col-span-2">
                                <span className="text-xs text-slate-400">Variant *</span>
                                <select value={form.variantId} onChange={(e) => setForm({ ...form, variantId: e.target.value })} className="border border-slate-200 rounded p-2 text-sm bg-white" required>
                                    <option value="">Select variant</option>
                                    {(selectedProduct.variants || []).map(v => (
                                        <option key={v.id} value={v.id}>{Object.values(v.attributes || {}).join(" / ")} (Stock: {v.stock})</option>
                                    ))}
                                </select>
                            </label>
                        )}
                        <label className="flex flex-col gap-1 col-span-2">
                            <span className="text-xs text-slate-400">Supplier / Source * (e.g. Karwan Bazar)</span>
                            <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="border border-slate-200 rounded p-2 text-sm bg-white" required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Quantity (pieces) *</span>
                            <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="border border-slate-200 rounded p-2 text-sm bg-white" required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Unit Cost (kena dam) *</span>
                            <input type="number" min={0} value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} className="border border-slate-200 rounded p-2 text-sm bg-white" required />
                        </label>
                        <label className="flex flex-col gap-1 col-span-2">
                            <span className="text-xs text-slate-400">Note (optional)</span>
                            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Cash, baki 2000" className="border border-slate-200 rounded p-2 text-sm bg-white" />
                        </label>
                    </div>
                    <button disabled={saving} className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit disabled:opacity-50">
                        {saving ? t('loading') : "Save Purchase"}
                    </button>
                </form>
            )}

            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 max-w-5xl">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">In Stock</th>
                            <th className="px-4 py-3">Purchased</th>
                            <th className="px-4 py-3">Avg Cost</th>
                            <th className="px-4 py-3">Last Supplier</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((p) => {
                            const stock = p.hasVariants ? p.variants.reduce((s, v) => s + (v.stock || 0), 0) : p.stock
                            return (
                                <Fragment key={p.id}>
                                    <tr className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 items-center">
                                                <Image width={40} height={40} className="p-1 shadow rounded" src={p.images?.[0] || "/assets/product_img1.png"} alt="" />
                                                <span className="max-w-44 truncate">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{stock}</span>
                                        </td>
                                        <td className="px-4 py-3">{p.totalPurchased || "—"}</td>
                                        <td className="px-4 py-3">{p.totalPurchased > 0 ? format(p.avgCost) : "—"}</td>
                                        <td className="px-4 py-3 text-xs">{p.lastPurchase ? `${p.lastPurchase.supplier} · ${new Date(p.lastPurchase.createdAt).toLocaleDateString()}` : "—"}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
                                                <ChevronDownIcon size={16} className={`transition ${expanded === p.id ? "rotate-180" : ""}`} />
                                            </button>
                                        </td>
                                    </tr>
                                    {expanded === p.id && (
                                        <tr key={p.id + "-detail"}>
                                            <td colSpan={6} className="px-4 py-3 bg-slate-50">
                                                {p.hasVariants && (
                                                    <div className="mb-3 flex flex-wrap gap-2">
                                                        {p.variantStats.map((vs) => {
                                                            const v = p.variants.find(x => x.id === vs.variantId)
                                                            return (
                                                                <span key={vs.variantId || "simple"} className="text-[11px] bg-white border border-slate-200 rounded-full px-3 py-1">
                                                                    {v ? Object.values(v.attributes || {}).join(" / ") : "Standard"}: stock {v?.stock ?? p.stock} · bought {vs.quantity} · avg {format(vs.avgCost)}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                                {p.variantStats.length === 0 || p.variantStats.every(vs => vs.batches.length === 0) ? (
                                                    <p className="text-xs text-slate-400">No purchase history yet — “Add Stock” diye prothom kena entry korun.</p>
                                                ) : (
                                                    <table className="w-full text-xs bg-white rounded-lg overflow-hidden border border-slate-200">
                                                        <thead className="bg-slate-100 text-slate-500">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left">Date</th>
                                                                <th className="px-3 py-2 text-left">Supplier</th>
                                                                <th className="px-3 py-2 text-left">Variant</th>
                                                                <th className="px-3 py-2 text-right">Qty</th>
                                                                <th className="px-3 py-2 text-right">Unit Cost</th>
                                                                <th className="px-3 py-2 text-right">Total</th>
                                                                <th className="px-3 py-2 text-left">Note</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {p.variantStats.flatMap(vs => vs.batches).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20).map((b) => {
                                                                const v = p.variants.find(x => x.id === b.variantId)
                                                                return (
                                                                    <tr key={b.id}>
                                                                        <td className="px-3 py-2 text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                                                                        <td className="px-3 py-2 font-medium text-slate-700">{b.supplier}</td>
                                                                        <td className="px-3 py-2 text-slate-500">{v ? Object.values(v.attributes || {}).join(" / ") : "—"}</td>
                                                                        <td className="px-3 py-2 text-right">{b.quantity}</td>
                                                                        <td className="px-3 py-2 text-right">{format(b.unitCost)}</td>
                                                                        <td className="px-3 py-2 text-right font-medium">{format(b.quantity * b.unitCost)}</td>
                                                                        <td className="px-3 py-2 text-slate-400 max-w-32 truncate">{b.note || "—"}</td>
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No products found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
