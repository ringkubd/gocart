'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"
import { PlusIcon, PencilIcon, Trash2Icon, KeyRoundIcon, BanIcon, CheckCircleIcon } from "lucide-react"

export default function AdminUsers() {

    const [users, setUsers] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [showAdd, setShowAdd] = useState(false)
    const [editUser, setEditUser] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)

    const emptyForm = { name: '', email: '', password: '', role: 'user' }
    const [form, setForm] = useState(emptyForm)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (roleFilter) params.set('role', roleFilter)
            const res = await fetch(`/api/admin/users?${params.toString()}`)
            const data = await res.json()
            if (res.ok) {
                setUsers(data.users)
                setRoles(data.roles)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        if (saving) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('User created')
            setShowAdd(false)
            setForm(emptyForm)
            fetchUsers()
        } catch (error) {
            toast.error(error.message || 'Failed')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (saving) return
        setSaving(true)
        try {
            const payload = { userId: editUser.id, name: form.name, role: form.role }
            if (form.email !== editUser.email) payload.email = form.email
            if (form.password) payload.password = form.password

            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('User updated')
            setEditUser(null)
            setForm(emptyForm)
            fetchUsers()
        } catch (error) {
            toast.error(error.message || 'Failed')
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (user) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, active: !user.active }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !user.active } : u))
            toast.success(user.active ? 'User suspended' : 'User activated')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const handleDelete = async (user) => {
        if (!confirm(`Delete user "${user.name}"? This removes their account, orders and data.`)) return
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            setUsers(prev => prev.filter(u => u.id !== user.id))
            toast.success('User deleted')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const startEdit = (user) => {
        setEditUser(user)
        setForm({ name: user.name, email: user.email, password: '', role: user.role })
        setShowPassword(false)
    }

    useEffect(() => {
        fetchUsers()
    }, [roleFilter])

    if (loading && users.length === 0) return <Loading />

    const inputCls = "border border-slate-200 rounded p-2 text-sm w-full"

    return (
        <div className="text-slate-500 mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl">User <span className="text-slate-800 font-medium">Management</span></h1>
                <button onClick={() => { setShowAdd(!showAdd); setEditUser(null); setForm(emptyForm) }} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900">
                    <PlusIcon size={16} /> {showAdd ? 'Cancel' : 'Add User'}
                </button>
            </div>

            {/* Search + role filter */}
            <div className="flex flex-wrap gap-3 mt-4">
                <form onSubmit={(e) => { e.preventDefault(); fetchUsers() }} className="flex gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name / email" className="border border-slate-200 outline-slate-400 p-2 rounded text-sm w-64" />
                    <button className="bg-slate-700 text-white px-4 rounded text-sm">Search</button>
                </form>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-slate-200 rounded p-2 text-sm">
                    <option value="">All roles</option>
                    {roles.map((r) => <option key={r.name} value={r.name}>{r.label}</option>)}
                </select>
            </div>

            {/* Add / Edit user form */}
            {(showAdd || editUser) && (
                <form onSubmit={editUser ? handleUpdate : handleCreate} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-xl flex flex-col gap-4 bg-slate-50/50">
                    <h3 className="font-medium text-slate-700">{editUser ? `Edit User — ${editUser.name}` : 'Create New User'}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Full Name</span>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Email (login)</span>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required />
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">Role</span>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                                {roles.map((r) => <option key={r.name} value={r.name}>{r.label}</option>)}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">{editUser ? 'New Password (leave blank to keep)' : 'Password'}</span>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} required={!editUser} minLength={6} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                                    <KeyRoundIcon size={16} />
                                </button>
                            </div>
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button disabled={saving} className="bg-slate-800 text-white px-6 py-2 rounded text-sm disabled:opacity-50">{saving ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}</button>
                        {editUser && <button type="button" onClick={() => setEditUser(null)} className="text-sm text-slate-400 hover:text-slate-600 px-2">Cancel</button>}
                    </div>
                </form>
            )}

            {/* Users table */}
            <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 max-w-6xl">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Orders</th>
                            <th className="px-4 py-3">Store</th>
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className={`hover:bg-slate-50 ${!user.active ? 'opacity-60' : ''}`}>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2 items-center">
                                        <Image width={32} height={32} className='rounded-full' src={user.image || "/assets/profile_pic1.jpg"} alt="" />
                                        <span className="font-medium text-slate-700">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-3 py-1 rounded-full ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-700'
                                        : user.role === 'seller' ? 'bg-blue-100 text-blue-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {user.roleRef?.label || user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-3 py-1 rounded-full ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{user._count?.buyerOrders || 0}</td>
                                <td className="px-4 py-3 text-xs">{user.store ? `@${user.store.username}` : '—'}</td>
                                <td className="px-4 py-3 text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => toggleActive(user)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title={user.active ? 'Suspend' : 'Activate'}>
                                            {user.active ? <BanIcon size={15} /> : <CheckCircleIcon size={15} />}
                                        </button>
                                        <button onClick={() => startEdit(user)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Edit"><PencilIcon size={15} /></button>
                                        <button onClick={() => handleDelete(user)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2Icon size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
