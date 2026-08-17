'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Trash2Icon } from "lucide-react"
import Image from "next/image"

export default function AdminSettings() {

    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState({})

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            const data = await res.json()
            if (res.ok) {
                setSettings(data.settings)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const saveSetting = async (key, value) => {
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Settings saved')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const saveGeneral = async (e) => {
        e.preventDefault()
        await saveSetting('siteName', settings.siteName)
        await saveSetting('tagline', settings.tagline)
        await saveSetting('currency', settings.currency)
        await saveSetting('siteLogo', settings.siteLogo)
        await saveSetting('siteFavicon', settings.siteFavicon)
    }

    const handleSiteLogo = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setSettings({ ...settings, siteLogo: data.url })
            toast.success('Logo uploaded')
        } catch (error) {
            toast.error('Upload failed')
        }
    }

    const handleFavicon = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setSettings({ ...settings, siteFavicon: data.url })
            toast.success('Favicon uploaded')
        } catch (error) {
            toast.error('Upload failed')
        }
    }

    const saveContact = async (e) => {
        e.preventDefault()
        await saveSetting('contact', settings.contact)
    }

    const saveFooter = async (e) => {
        e.preventDefault()
        await saveSetting('footer', settings.footer)
    }

    const saveFacebook = async (e) => {
        e.preventDefault()
        await saveSetting('facebook', settings.facebook)
    }

    const saveShippingNote = async (e) => {
        e.preventDefault()
        await saveSetting('shippingNote', settings.shippingNote)
    }

    const saveDeliveryRules = async (e) => {
        e.preventDefault()
        await saveSetting('minimumOrderFreeDelivery', Number(settings.minimumOrderFreeDelivery || 0))
        await saveSetting('bundleFreeQty', Number(settings.bundleFreeQty || 0))
    }

    const saveCurrencies = async (e) => {
        e.preventDefault()
        await saveSetting('currencies', settings.currencies)
        await saveSetting('defaultCurrency', settings.defaultCurrency)
        await saveSetting('autoUpdateRates', Boolean(settings.autoUpdateRates))
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20 max-w-2xl">
            <h1 className="text-2xl">Site <span className="text-slate-800 font-medium">Settings</span></h1>
            <p className="text-sm text-slate-400 mt-1">General store settings shown across the storefront.</p>

            {/* General */}
            <form onSubmit={saveGeneral} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">General</h3>
                <label className="flex items-center gap-4">
                    <Image src={settings.siteLogo || "/assets/gs_logo.jpg"} width={56} height={56} className="rounded-full h-14 w-14 object-cover border border-slate-200" alt="Site logo" />
                    <div>
                        <span className="text-xs text-slate-400 block mb-1">Site Logo (shown in navbar & footer)</span>
                        <input type="file" accept="image/*" onChange={handleSiteLogo} className="text-sm" />
                        <p className="text-[10px] text-slate-300 mt-1">Leave empty to keep the text logo (theDhakaShop.)</p>
                    </div>
                </label>
                <label className="flex items-center gap-4">
                    <Image src={settings.siteFavicon || "/favicon.ico"} width={40} height={40} className="rounded h-10 w-10 object-contain border border-slate-200" alt="Site favicon" />
                    <div>
                        <span className="text-xs text-slate-400 block mb-1">Site Favicon (browser tab icon)</span>
                        <input type="file" accept="image/*" onChange={handleFavicon} className="text-sm" />
                        <p className="text-[10px] text-slate-300 mt-1">Upload .ico, .png or .svg. Leave empty to use the default.</p>
                    </div>
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Site Name</span>
                    <input value={settings.siteName || ''} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Tagline</span>
                    <input value={settings.tagline || ''} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Currency Symbol</span>
                    <input value={settings.currency || ''} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="border border-slate-200 rounded p-2 text-sm max-w-20" />
                </label>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save General</button>
            </form>

            {/* Contact */}
            <form onSubmit={saveContact} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Contact Info (Footer)</h3>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Email</span>
                    <input value={settings.contact?.email || ''} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Phone</span>
                    <input value={settings.contact?.phone || ''} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Address</span>
                    <input value={settings.contact?.address || ''} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Contact</button>
            </form>

            {/* Footer */}
            <form onSubmit={saveFooter} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Footer</h3>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">About Text</span>
                    <textarea value={settings.footer?.about || ''} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, about: e.target.value } })} rows={3} className="border border-slate-200 rounded p-2 text-sm resize-none" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Facebook URL</span>
                        <input value={settings.footer?.social?.facebook || ''} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, social: { ...settings.footer?.social, facebook: e.target.value } } })} className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Instagram URL</span>
                        <input value={settings.footer?.social?.instagram || ''} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, social: { ...settings.footer?.social, instagram: e.target.value } } })} className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Twitter / X URL</span>
                        <input value={settings.footer?.social?.twitter || ''} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, social: { ...settings.footer?.social, twitter: e.target.value } } })} className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">YouTube URL</span>
                        <input value={settings.footer?.social?.youtube || ''} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, social: { ...settings.footer?.social, youtube: e.target.value } } })} className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                </div>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Footer</button>
            </form>

            {/* Facebook */}
            <form onSubmit={saveFacebook} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Facebook / Meta Integration</h3>
                <p className="text-xs text-slate-400 -mt-2">
                    Meta Pixel ID enables conversion tracking. Messenger Page ID adds a live chat button. Page URL links your store to your Facebook page.
                </p>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Facebook Page URL</span>
                    <input value={settings.facebook?.pageUrl || ''} onChange={(e) => setSettings({ ...settings, facebook: { ...settings.facebook, pageUrl: e.target.value } })} placeholder="https://facebook.com/yourpage" className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Meta Pixel ID</span>
                        <input value={settings.facebook?.pixelId || ''} onChange={(e) => setSettings({ ...settings, facebook: { ...settings.facebook, pixelId: e.target.value } })} placeholder="e.g. 123456789012345" className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Messenger Page ID</span>
                        <input value={settings.facebook?.messengerPageId || ''} onChange={(e) => setSettings({ ...settings, facebook: { ...settings.facebook, messengerPageId: e.target.value } })} placeholder="Your page ID" className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                </div>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.facebook?.messengerEnabled || false} onChange={(e) => setSettings({ ...settings, facebook: { ...settings.facebook, messengerEnabled: e.target.checked } })} className="accent-green-500" />
                    <span className="text-sm">Enable Messenger chat button on storefront</span>
                </label>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Facebook Settings</button>
            </form>

            {/* Shipping note */}
            <form onSubmit={saveShippingNote} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Checkout Notes</h3>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Shipping / payment note shown at checkout</span>
                    <textarea value={settings.shippingNote || ''} onChange={(e) => setSettings({ ...settings, shippingNote: e.target.value })} rows={2} className="border border-slate-200 rounded p-2 text-sm resize-none" placeholder="e.g. Delivery within 2-4 working days across Bangladesh. Cash on delivery available." />
                </label>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Note</button>
            </form>

            {/* Delivery Rules */}
            <form onSubmit={saveDeliveryRules} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Free Delivery Rules</h3>
                <p className="text-xs text-slate-400 -mt-2">
                    Global rules applied on top of per-product delivery settings. These override individual product delivery charges when conditions are met.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Min Order Amount for Free Delivery (base currency)</span>
                        <input type="number" value={settings.minimumOrderFreeDelivery || ''} onChange={(e) => setSettings({ ...settings, minimumOrderFreeDelivery: e.target.value })} placeholder="0" className="border border-slate-200 rounded p-2 text-sm" />
                        <span className="text-[10px] text-slate-300">If order subtotal reaches this, all product delivery fees become zero.</span>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Min Products for Bundle Free Delivery</span>
                        <input type="number" value={settings.bundleFreeQty || ''} onChange={(e) => setSettings({ ...settings, bundleFreeQty: e.target.value })} placeholder="0" className="border border-slate-200 rounded p-2 text-sm" />
                        <span className="text-[10px] text-slate-300">If total items in order reach this count, all delivery fees become zero.</span>
                    </label>
                </div>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Delivery Rules</button>
            </form>

            {/* Currencies */}
            <form onSubmit={saveCurrencies} className="mt-6 border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Currencies</h3>
                <p className="text-xs text-slate-400 -mt-2">
                    Set the rate for each currency. If you store prices directly in BDT (Bangladeshi Taka), set BDT rate to <b>1</b> and keep it as the only currency. Auto-updating live rates is disabled by default so your prices are never changed unexpectedly.
                </p>

                <label className="flex flex-col gap-1 max-w-xs">
                    <span className="text-xs text-slate-400">Default Currency (shown to new visitors)</span>
                    <select
                        value={settings.defaultCurrency || (settings.currencies && settings.currencies[0]?.code) || 'USD'}
                        onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                        className="border border-slate-200 rounded p-2 text-sm"
                    >
                        {(settings.currencies || []).map((c) => (
                            <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.symbol})</option>
                        ))}
                    </select>
                </label>

                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={Boolean(settings.autoUpdateRates)} onChange={(e) => setSettings({ ...settings, autoUpdateRates: e.target.checked })} className="accent-green-500" />
                    <span className="text-sm">Auto-update rates from a live API (overrides the rates below)</span>
                </label>

                <div className="flex flex-col gap-3">
                    {(settings.currencies || []).map((c, i) => (
                        <div key={c.code || i} className="flex gap-2 items-end">
                            <div className="grid grid-cols-[1fr_1fr_1fr_80px] gap-2 flex-1">
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Code</span>
                                    <input value={c.code} onChange={(e) => {
                                        const arr = [...(settings.currencies || [])]
                                        arr[i] = { ...c, code: e.target.value.toUpperCase() }
                                        setSettings({ ...settings, currencies: arr })
                                    }} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Name</span>
                                    <input value={c.name || ''} onChange={(e) => {
                                        const arr = [...(settings.currencies || [])]
                                        arr[i] = { ...c, name: e.target.value }
                                        setSettings({ ...settings, currencies: arr })
                                    }} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Symbol</span>
                                    <input value={c.symbol || ''} onChange={(e) => {
                                        const arr = [...(settings.currencies || [])]
                                        arr[i] = { ...c, symbol: e.target.value }
                                        setSettings({ ...settings, currencies: arr })
                                    }} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Rate</span>
                                    <input type="number" step="0.01" value={c.rate} onChange={(e) => {
                                        const arr = [...(settings.currencies || [])]
                                        arr[i] = { ...c, rate: Number(e.target.value) }
                                        setSettings({ ...settings, currencies: arr })
                                    }} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!confirm(`Remove ${c.name} (${c.code}) from available currencies?`)) return
                                    const arr = (settings.currencies || []).filter((_, idx) => idx !== i)
                                    setSettings({ ...settings, currencies: arr })
                                    if (settings.defaultCurrency === c.code) {
                                        setSettings(prev => ({ ...prev, defaultCurrency: (arr[0]?.code) || '' }))
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-sm border border-red-200"
                                title="Remove currency"
                            >
                                <Trash2Icon size={14} />
                                <span className="hidden sm:inline">Remove</span>
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setSettings({ ...settings, currencies: [...(settings.currencies || []), { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 }] })} className="text-sm text-green-600 w-fit">+ Add Currency</button>
                </div>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Currencies</button>
            </form>
        </div>
    )
}
