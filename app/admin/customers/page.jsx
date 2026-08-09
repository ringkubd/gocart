'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function AdminCustomers() {

    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchCustomers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            const res = await fetch(`/api/admin/customers?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                setCustomers(data.customers)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    if (loading && customers.length === 0) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl">Customer <span className="text-slate-800 font-medium">Management</span></h1>
                <form onSubmit={(e) => { e.preventDefault(); fetchCustomers() }} className="flex gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name / email" className="border border-slate-200 outline-slate-400 p-2 rounded text-sm w-60" />
                    <button className="bg-slate-700 text-white px-4 rounded text-sm">Search</button>
                </form>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 max-w-5xl">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Store</th>
                            <th className="px-4 py-3">Orders</th>
                            <th className="px-4 py-3">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 items-center">
                                        <Image width={32} height={32} className='rounded-full' src={customer.image || "/assets/profile_pic1.jpg"} alt="" />
                                        <span className="font-medium text-slate-700">{customer.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">{customer.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-3 py-1 rounded-full ${customer.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{customer.role}</span>
                                </td>
                                <td className="px-4 py-3 text-xs">{customer.store ? `@${customer.store.username}` : '—'}</td>
                                <td className="px-4 py-3">{customer._count?.buyerOrders || 0}</td>
                                <td className="px-4 py-3 text-xs text-slate-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No customers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
