'use client'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { DeleteIcon, PencilIcon } from "lucide-react"

export default function AdminCoupons() {

    const [coupons, setCoupons] = useState([])
    const [editingCode, setEditingCode] = useState(null)

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: true,
        expiresAt: new Date()
    })

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/coupons')
            const data = await res.json()
            if (res.ok) {
                setCoupons(data.coupons)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const resetForm = () => {
        setEditingCode(null)
        setNewCoupon({ code: '', description: '', discount: '', forNewUser: false, forMember: false, isPublic: true, expiresAt: new Date() })
    }

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/coupons', {
                method: editingCode ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newCoupon, code: newCoupon.code.toUpperCase() }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to save coupon')
            }
            toast.success(editingCode ? 'Coupon updated' : 'Coupon added')
            resetForm()
            fetchCoupons()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const handleEdit = (coupon) => {
        setEditingCode(coupon.code)
        setNewCoupon({
            code: coupon.code,
            description: coupon.description,
            discount: coupon.discount,
            forNewUser: coupon.forNewUser,
            forMember: coupon.forMember,
            isPublic: coupon.isPublic,
            expiresAt: new Date(coupon.expiresAt),
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    const deleteCoupon = async (code) => {
        try {
            const res = await fetch('/api/coupons', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to delete')
            }
            toast.success('Coupon deleted')
            setCoupons(prev => prev.filter(c => c.code !== code))
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
        fetchCoupons();
    }, [])

    return (
        <div className="text-slate-500 mb-40">

            {/* Add Coupon */}
            <form onSubmit={(e) => toast.promise(handleAddCoupon(e), { loading: editingCode ? "Updating coupon..." : "Adding coupon..." })} className="max-w-sm text-sm">
                <h2 className="text-2xl">{editingCode ? 'Edit' : 'Add'} <span className="text-slate-800 font-medium">Coupons</span></h2>
                {editingCode && <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600 underline mt-1">Cancel editing</button>}
                <div className="flex gap-2 max-sm:flex-col mt-2">
                    <input type="text" placeholder="Coupon Code" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="code" value={newCoupon.code} onChange={handleChange} required disabled={!!editingCode}
                    />
                    <input type="number" placeholder="Coupon Discount (%)" min={1} max={100} className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="discount" value={newCoupon.discount} onChange={handleChange} required
                    />
                </div>
                <input type="text" placeholder="Coupon Description" className="w-full mt-2 p-2 border border-slate-200 outline-slate-400 rounded-md"
                    name="description" value={newCoupon.description} onChange={handleChange} required
                />

                <label>
                    <p className="mt-3">Coupon Expiry Date</p>
                    <input type="date" placeholder="Coupon Expires At" className="w-full mt-1 p-2 border border-slate-200 outline-slate-400 rounded-md"
                        name="expiresAt" value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} onChange={handleChange}
                    />
                </label>

                <div className="mt-5">
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forNewUser" checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For New User</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                            <input type="checkbox" className="sr-only peer"
                                name="forMember" checked={newCoupon.forMember}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                        </label>
                        <p>For Member</p>
                    </div>
                </div>
                <button className="mt-4 p-2 px-10 rounded bg-slate-700 text-white active:scale-95 transition">{editingCode ? 'Update Coupon' : 'Add Coupon'}</button>
            </form>

            {/* List Coupons */}
            <div className="mt-14">
                <h2 className="text-2xl">List <span className="text-slate-800 font-medium">Coupons</span></h2>
                {coupons.length ? (
                <div className="overflow-x-auto mt-4 rounded-lg border border-slate-200 max-w-4xl">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Code</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Discount</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Expires At</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">New User</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">For Member</th>
                                <th className="py-3 px-4 text-left font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon.code} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 font-medium text-slate-800">{coupon.code}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.description}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.discount}%</td>
                                    <td className="py-3 px-4 text-slate-800">{format(new Date(coupon.expiresAt), 'yyyy-MM-dd')}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.forNewUser ? 'Yes' : 'No'}</td>
                                    <td className="py-3 px-4 text-slate-800">{coupon.forMember ? 'Yes' : 'No'}</td>
                                    <td className="py-3 px-4 text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <PencilIcon onClick={() => handleEdit(coupon)} className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" />
                                            <DeleteIcon onClick={() => toast.promise(deleteCoupon(coupon.code), { loading: "Deleting coupon..." })} className="w-5 h-5 text-red-500 hover:text-red-800 cursor-pointer" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                    <p className="text-slate-400 mt-3">No coupons yet.</p>
                )}
            </div>
        </div>
    )
}
