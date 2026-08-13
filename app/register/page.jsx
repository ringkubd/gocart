'use client'
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "@/components/LanguageProvider"

export default function Register() {
    const router = useRouter()
    const { t } = useLanguage()
    const [form, setForm] = useState({ name: "", email: "", password: "" })

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const onSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            })
            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || "Registration failed")
                return
            }

            const login = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            })

            if (login?.error) {
                toast.error("Registered, please login")
                router.push("/login")
            } else {
                toast.success("Account created")
                router.push("/")
                router.refresh()
            }
        } catch (error) {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
            <form onSubmit={onSubmit} className="w-full max-w-sm text-slate-600 flex flex-col gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-800">{t('registerTitle')}</h1>
                    <p className="text-sm text-slate-400 mt-1">{t('createAccount')}</p>
                </div>
                <input name="name" type="text" placeholder={t('fullName')} required value={form.name} onChange={onChange} className="p-2.5 px-4 outline-none border border-slate-200 rounded w-full" />
                <input name="email" type="email" placeholder={t('emailAddress')} required value={form.email} onChange={onChange} className="p-2.5 px-4 outline-none border border-slate-200 rounded w-full" />
                <input name="password" type="password" placeholder={t('password')} required minLength={6} value={form.password} onChange={onChange} className="p-2.5 px-4 outline-none border border-slate-200 rounded w-full" />
                <button className="bg-slate-800 text-white py-2.5 rounded hover:bg-slate-900 transition">{t('register')}</button>
                <p className="text-sm text-center">
                    {t('alreadyHaveAccount')} <Link href="/login" className="text-green-600 font-medium">{t('login')}</Link>
                </p>
            </form>
        </div>
    )
}
