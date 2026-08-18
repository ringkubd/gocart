'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"
import { useLanguage } from "@/components/LanguageProvider"

export default function StoreProfile() {

    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [store, setStore] = useState({
        name: "",
        description: "",
        email: "",
        contact: "",
        address: "",
        logo: "",
        enableShare: true,
        enableMessenger: true,
        messengerType: "messenger",
        messengerUrl: "",
    })

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/store/profile')
            const data = await res.json()
            if (res.ok) {
                setStore({
                    name: data.store.name,
                    description: data.store.description,
                    email: data.store.email,
                    contact: data.store.contact,
                    address: data.store.address,
                    logo: data.store.logo,
                    enableShare: data.store.enableShare ?? true,
                    enableMessenger: data.store.enableMessenger ?? true,
                    messengerType: data.store.messengerType || "messenger",
                    messengerUrl: data.store.messengerUrl || "",
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogo = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setStore({ ...store, logo: data.url })
            toast.success(t('uploaded'))
        } catch (error) {
            toast.error('Upload failed')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (saving) return
        setSaving(true)
        try {
            const res = await fetch('/api/store/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(store),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to save')
            toast.success(t('profileUpdated'))
        } catch (error) {
            toast.error(error.message || 'Failed')
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20 max-w-2xl">
            <h1 className="text-2xl">{t('storeProfile')}</h1>
            <p className="text-sm text-slate-400 mt-1">Update your store information shown on the storefront.</p>

            <form onSubmit={handleSubmit} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <label className="cursor-pointer w-fit">
                    <span className="text-xs text-slate-400 block mb-2">{t('storeLogo')}</span>
                    <Image src={store.logo || "/assets/happy_store.webp"} width={80} height={80} className="rounded-full shadow h-20 w-20 object-cover" alt="" />
                    <input type="file" accept="image/*" onChange={handleLogo} hidden />
                    <span className="text-xs text-green-600 mt-1 block">Click to change</span>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">{t('storeName')}</span>
                    <input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">{t('description')}</span>
                    <textarea value={store.description} onChange={(e) => setStore({ ...store, description: e.target.value })} rows={3} className="border border-slate-200 rounded p-2 text-sm resize-none" required />
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">{t('email')}</span>
                        <input type="email" value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">{t('contactNumber')}</span>
                        <input value={store.contact} onChange={(e) => setStore({ ...store, contact: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                    </label>
                </div>

                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">{t('address')}</span>
                    <input value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                </label>

                {/* Share & Messenger Settings */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                    <p className="text-sm font-medium text-slate-600 mb-3">Product Page Actions</p>
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked={store.enableShare} onChange={(e) => setStore({ ...store, enableShare: e.target.checked })} className="accent-green-500 w-4 h-4" />
                            <span className="text-sm">Enable Share button on product pages</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input type="checkbox" checked={store.enableMessenger} onChange={(e) => setStore({ ...store, enableMessenger: e.target.checked })} className="accent-green-500 w-4 h-4" />
                            <span className="text-sm">Enable Order via Messenger button on product pages</span>
                        </label>
                    </div>
                    {store.enableMessenger && (
                        <div className="mt-3 flex flex-col gap-3">
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Messenger Platform</span>
                                <select value={store.messengerType} onChange={(e) => setStore({ ...store, messengerType: e.target.value })} className="border border-slate-200 rounded p-2 text-sm">
                                    <option value="messenger">Facebook Messenger</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="imo">IMO</option>
                                    <option value="custom">Custom Link</option>
                                </select>
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">
                                    {store.messengerType === 'whatsapp' ? 'WhatsApp Number (with country code, e.g. 8801712345678)' :
                                     store.messengerType === 'imo' ? 'IMO Number' :
                                     store.messengerType === 'custom' ? 'Custom URL (e.g. https://t.me/yourstore)' :
                                     'Facebook Page Username or Messenger Link'}
                                </span>
                                <input value={store.messengerUrl} onChange={(e) => setStore({ ...store, messengerUrl: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" placeholder={
                                    store.messengerType === 'whatsapp' ? '8801712345678' :
                                    store.messengerType === 'imo' ? 'Your IMO number' :
                                    store.messengerType === 'custom' ? 'https://t.me/yourstore' :
                                    'your Facebook page username'
                                } />
                            </label>
                        </div>
                    )}
                </div>

                <button disabled={saving} className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit disabled:opacity-50">
                    {saving ? t('loading') : t('saveProfile')}
                </button>
            </form>
        </div>
    )
}
