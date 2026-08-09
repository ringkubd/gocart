'use client'
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

export default function Login() {
    const router = useRouter()
    const [form, setForm] = useState({ email: "", password: "" })

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const onSubmit = async (e) => {
        e.preventDefault()
        const res = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        })
        if (res?.error) {
            toast.error("Invalid email or password")
        } else {
            toast.success("Logged in")
            router.push("/")
            router.refresh()
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <form onSubmit={onSubmit} className="w-full max-w-sm text-slate-600 flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-800">Login</h1>
                    <p className="text-sm text-slate-400 mt-1">Welcome back! Please login to continue.</p>
                </div>
                <input name="email" type="email" placeholder="Email address" required value={form.email} onChange={onChange} className="p-2.5 px-4 outline-none border border-slate-200 rounded w-full" />
                <input name="password" type="password" placeholder="Password" required value={form.password} onChange={onChange} className="p-2.5 px-4 outline-none border border-slate-200 rounded w-full" />
                <button className="bg-slate-800 text-white py-2.5 rounded hover:bg-slate-900 transition">Login</button>
                <p className="text-sm text-center">
                    Don&apos;t have an account? <Link href="/register" className="text-green-600 font-medium">Register</Link>
                </p>
            </form>
        </div>
    )
}
