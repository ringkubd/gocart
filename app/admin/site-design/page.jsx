'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"
import { PencilIcon, Trash2Icon, PlusIcon } from "lucide-react"

export default function AdminSiteDesign() {

    const [tab, setTab] = useState('hero')
    const [loading, setLoading] = useState(true)

    // Hero slides
    const [slides, setSlides] = useState([])
    const [slideForm, setSlideForm] = useState({ id: '', title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', active: true, sortOrder: 0 })
    const [showSlideForm, setShowSlideForm] = useState(false)

    // Categories
    const [categories, setCategories] = useState([])
    const [catForm, setCatForm] = useState({ id: '', name: '', nameBn: '', image: '', active: true, sortOrder: 0 })

    // Promo strip + settings
    const [settings, setSettings] = useState({})

    const fetchData = async () => {
        setLoading(true)
        try {
            const [slidesRes, catsRes, settingsRes] = await Promise.all([
                fetch('/api/admin/hero-slides'),
                fetch('/api/admin/categories'),
                fetch('/api/admin/settings'),
            ])
            const slidesData = await slidesRes.json()
            const catsData = await catsRes.json()
            const settingsData = await settingsRes.json()
            if (slidesRes.ok) setSlides(slidesData.slides)
            if (catsRes.ok) setCategories(catsData.categories)
            if (settingsRes.ok) setSettings(settingsData.settings)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const saveSlide = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/hero-slides', {
                method: slideForm.id ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(slideForm),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success(slideForm.id ? 'Slide updated' : 'Slide added')
            setSlideForm({ id: '', title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', active: true, sortOrder: 0 })
            setShowSlideForm(false)
            fetchData()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const deleteSlide = async (id) => {
        if (!confirm('Delete this slide?')) return
        try {
            const res = await fetch('/api/admin/hero-slides', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            if (!res.ok) throw new Error('Failed')
            setSlides(prev => prev.filter(s => s.id !== id))
            toast.success('Slide deleted')
        } catch (error) {
            toast.error('Failed')
        }
    }

    const toggleSlide = async (slide) => {
        try {
            const res = await fetch('/api/admin/hero-slides', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: slide.id, active: !slide.active }),
            })
            if (!res.ok) throw new Error('Failed')
            setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, active: !slide.active } : s))
        } catch (error) {
            toast.error('Failed')
        }
    }

    const saveCategory = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/categories', {
                method: catForm.id ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catForm),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success(catForm.id ? 'Category updated' : 'Category added')
            setCatForm({ id: '', name: '', nameBn: '', image: '', active: true, sortOrder: 0 })
            fetchData()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const deleteCategory = async (id) => {
        if (!confirm('Delete this category?')) return
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            if (!res.ok) throw new Error('Failed')
            setCategories(prev => prev.filter(c => c.id !== id))
            toast.success('Category deleted')
        } catch (error) {
            toast.error('Failed')
        }
    }

    const toggleCategory = async (cat) => {
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: cat.id, active: !cat.active }),
            })
            if (!res.ok) throw new Error('Failed')
            setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, active: !cat.active } : c))
        } catch (error) {
            toast.error('Failed')
        }
    }

    const savePromoStrip = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'promoStrip', value: settings.promoStrip }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Promo strip saved')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const saveAnnouncement = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'announcement', value: settings.announcement }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Announcement saved')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const saveFooter = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'footer', value: settings.footer }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Footer saved')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const saveOurSpecs = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'ourSpecs', value: settings.ourSpecs || [] }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('Our Specifications saved')
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    const updateSpec = (index, field, value) => {
        const arr = [...(settings.ourSpecs || [])]
        arr[index] = { ...arr[index], [field]: value }
        setSettings({ ...settings, ourSpecs: arr })
    }

    const handleImageUpload = async (file) => {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        return data.url
    }

    const onSlideImagePick = async (e) => {
        try {
            const url = await handleImageUpload(e.target.files[0])
            setSlideForm({ ...slideForm, image: url })
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Upload failed')
        }
    }

    const onCategoryImagePick = async (e) => {
        try {
            const url = await handleImageUpload(e.target.files[0])
            setCatForm({ ...catForm, image: url })
            toast.success('Image uploaded')
        } catch (error) {
            toast.error('Upload failed')
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading) return <Loading />

    const tabs = [
        { key: 'hero', label: 'Hero Slider' },
        { key: 'promo', label: 'Promo Strip' },
        { key: 'announcement', label: 'Announcement' },
        { key: 'categories', label: 'Categories' },
        { key: 'ourSpecs', label: 'Our Specs' },
        { key: 'footer', label: 'Footer' },
    ]

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">Site <span className="text-slate-800 font-medium">Design</span></h1>
            <p className="text-sm text-slate-400 mt-1">Control the storefront content from here.</p>

            {/* Tabs */}
            <div className="flex gap-2 mt-5 border-b border-slate-200">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? 'border-green-500 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{t.label}</button>
                ))}
            </div>

            {/* HERO SLIDES */}
            {tab === 'hero' && (
                <div className="mt-6 max-w-4xl">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-slate-700">Homepage Hero Slides</h3>
                        <button onClick={() => setShowSlideForm(!showSlideForm)} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900">
                            <PlusIcon size={16} /> {showSlideForm ? 'Cancel' : 'Add Slide'}
                        </button>
                    </div>

                    {showSlideForm && (
                        <form onSubmit={saveSlide} className="border border-slate-200 rounded-xl p-6 mt-4 flex flex-col gap-4 bg-slate-50/50">
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-slate-400">Title</span>
                                    <input value={slideForm.title} onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                                </label>
                                <label className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-slate-400">Subtitle</span>
                                    <input value={slideForm.subtitle} onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Button Text</span>
                                    <input value={slideForm.buttonText} onChange={(e) => setSlideForm({ ...slideForm, buttonText: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Link</span>
                                    <input value={slideForm.link} onChange={(e) => setSlideForm({ ...slideForm, link: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" placeholder="/shop" />
                                </label>
                                <label className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-slate-400">Slide Image</span>
                                    <div className="flex items-center gap-3">
                                        {slideForm.image && <Image src={slideForm.image} width={80} height={80} className="rounded object-cover h-20 w-auto" alt="" />}
                                        <input type="file" accept="image/*" onChange={onSlideImagePick} className="text-sm" />
                                    </div>
                                </label>
                            </div>
                            <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Slide</button>
                        </form>
                    )}

                    <div className="mt-4 flex flex-col gap-3">
                        {slides.map((slide) => (
                            <div key={slide.id} className={`border rounded-xl p-4 flex items-center gap-4 ${slide.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                                <Image src={slide.image} width={80} height={80} className="rounded object-cover h-16 w-24" alt="" />
                                <div className="flex-1">
                                    <p className="font-medium text-slate-700">{slide.title}</p>
                                    <p className="text-xs text-slate-400 truncate">{slide.subtitle}</p>
                                    <p className="text-xs text-slate-400 mt-1">Button: {slide.buttonText} → {slide.link || '/'} · Order: {slide.sortOrder}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toggleSlide(slide)} checked={slide.active} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                                <button onClick={() => { setSlideForm(slide); setShowSlideForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><PencilIcon size={16} /></button>
                                <button onClick={() => deleteSlide(slide.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                            </div>
                        ))}
                        {slides.length === 0 && <p className="text-sm text-slate-400">No slides yet.</p>}
                    </div>
                </div>
            )}

            {/* PROMO STRIP */}
            {tab === 'promo' && (
                <form onSubmit={savePromoStrip} className="mt-6 max-w-lg border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                    <h3 className="font-medium text-slate-700">Top Promo Strip</h3>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={settings.promoStrip?.active} onChange={(e) => setSettings({ ...settings, promoStrip: { ...settings.promoStrip, active: e.target.checked } })} className="accent-green-500" />
                        <span className="text-sm">Show promo strip on storefront</span>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Promo Text</span>
                        <input value={settings.promoStrip?.text || ''} onChange={(e) => setSettings({ ...settings, promoStrip: { ...settings.promoStrip, text: e.target.value } })} className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Coupon Code (copied on click)</span>
                        <input value={settings.promoStrip?.couponCode || ''} onChange={(e) => setSettings({ ...settings, promoStrip: { ...settings.promoStrip, couponCode: e.target.value } })} className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Promo Strip</button>
                </form>
            )}

            {/* ANNOUNCEMENT */}
            {tab === 'announcement' && (
                <form onSubmit={saveAnnouncement} className="mt-6 max-w-lg border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                    <h3 className="font-medium text-slate-700">Site Announcement</h3>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={settings.announcement?.active} onChange={(e) => setSettings({ ...settings, announcement: { ...settings.announcement, active: e.target.checked } })} className="accent-green-500" />
                        <span className="text-sm">Show announcement bar</span>
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Announcement Text</span>
                        <input value={settings.announcement?.text || ''} onChange={(e) => setSettings({ ...settings, announcement: { ...settings.announcement, text: e.target.value } })} className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Announcement</button>
                </form>
            )}

            {/* OUR SPECS */}
            {tab === 'ourSpecs' && (
                <form onSubmit={saveOurSpecs} className="mt-6 max-w-3xl border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                    <h3 className="font-medium text-slate-700">Our Specifications (homepage cards)</h3>
                    <p className="text-xs text-slate-400 -mt-2">
                        These cards appear on the homepage. Edit title, description, icon and accent color. Icon keys: truck, shield, support, returns, discount, package.
                    </p>

                    {(settings.ourSpecs && settings.ourSpecs.length > 0 ? settings.ourSpecs : [
                        { title: 'Free & Fast Delivery', description: 'Free shipping on orders over a threshold, delivered quickly across Bangladesh.', icon: 'truck', accent: '#16a34a' },
                        { title: 'Secure Payments', description: 'Cash on delivery, bKash, Nagad and more — your payments are safe with us.', icon: 'shield', accent: '#2563eb' },
                        { title: '24/7 Support', description: 'Our support team is here to help you anytime via live chat and tickets.', icon: 'support', accent: '#9333ea' },
                    ]).map((spec, i) => (
                        <div key={i} className="border border-slate-200 rounded-lg p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-600">Card {i + 1}</p>
                                <button type="button" onClick={() => setSettings({ ...settings, ourSpecs: (settings.ourSpecs || []).filter((_, idx) => idx !== i) })} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-slate-400">Title</span>
                                    <input value={spec.title || ''} onChange={(e) => updateSpec(i, 'title', e.target.value)} className="border border-slate-200 rounded p-2 text-sm" />
                                </label>
                                <label className="flex flex-col gap-1 col-span-2">
                                    <span className="text-xs text-slate-400">Description</span>
                                    <textarea value={spec.description || ''} onChange={(e) => updateSpec(i, 'description', e.target.value)} rows={2} className="border border-slate-200 rounded p-2 text-sm resize-none" />
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Icon</span>
                                    <select value={spec.icon || 'shield'} onChange={(e) => updateSpec(i, 'icon', e.target.value)} className="border border-slate-200 rounded p-2 text-sm">
                                        <option value="truck">truck</option>
                                        <option value="shield">shield</option>
                                        <option value="support">support</option>
                                        <option value="returns">returns</option>
                                        <option value="discount">discount</option>
                                        <option value="package">package</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="text-xs text-slate-400">Accent Color</span>
                                    <div className="flex gap-2 items-center">
                                        <input type="color" value={spec.accent || '#16a34a'} onChange={(e) => updateSpec(i, 'accent', e.target.value)} className="h-8 w-10 rounded border border-slate-200" />
                                        <input value={spec.accent || '#16a34a'} onChange={(e) => updateSpec(i, 'accent', e.target.value)} className="border border-slate-200 rounded p-2 text-sm flex-1" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={() => setSettings({ ...settings, ourSpecs: [...(settings.ourSpecs || []), { title: 'New Feature', description: 'Describe this feature.', icon: 'shield', accent: '#16a34a' }] })} className="text-sm text-green-600 w-fit">+ Add Card</button>

                    <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Our Specifications</button>
                </form>
            )}

            {/* FOOTER */}
            {tab === 'footer' && (
                <form onSubmit={saveFooter} className="mt-6 max-w-2xl border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
                    <h3 className="font-medium text-slate-700">Footer Content</h3>
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
            )}

            {/* CATEGORIES */}
            {tab === 'categories' && (
                <div className="mt-6 max-w-4xl">
                    <h3 className="font-medium text-slate-700">Storefront Categories</h3>
                    <form onSubmit={saveCategory} className="border border-slate-200 rounded-xl p-6 mt-4 flex flex-col gap-4 bg-slate-50/50">
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col gap-1 col-span-2">
                                <span className="text-xs text-slate-400">Category Name</span>
                                <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" required />
                            </label>
                            <label className="flex flex-col gap-1 col-span-2">
                                <span className="text-xs text-slate-400">Category Name (বাংলা)</span>
                                <input value={catForm.nameBn || ''} onChange={(e) => setCatForm({ ...catForm, nameBn: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" placeholder="ক্যাটাগরির নাম" />
                            </label>
                            <label className="flex flex-col gap-1 col-span-2">
                                <span className="text-xs text-slate-400">Category Image</span>
                                <div className="flex items-center gap-3">
                                    {catForm.image && <Image src={catForm.image} width={48} height={48} className="rounded object-cover h-12 w-12" alt="" />}
                                    <input type="file" accept="image/*" onChange={onCategoryImagePick} className="text-sm" />
                                </div>
                                <span className="text-[10px] text-slate-300">or</span>
                                <input value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" placeholder="Or paste image URL like /uploads/xxx.png" />
                            </label>
                        </div>
                        <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">{catForm.id ? 'Update Category' : 'Add Category'}</button>
                    </form>

                    <div className="mt-4 flex flex-col gap-3">
                        {categories.map((cat) => (
                            <div key={cat.id} className={`border rounded-xl p-3 flex items-center gap-4 ${cat.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                                {cat.image && <Image src={cat.image} width={48} height={48} className="rounded object-cover h-12 w-12" alt="" />}
                                <div className="flex-1">
                                    <p className="font-medium text-slate-700">{cat.name}</p>
                                    <p className="text-xs text-slate-400">/shop?category={cat.slug}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toggleCategory(cat)} checked={cat.active} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                                </label>
                                <button onClick={() => { setCatForm(cat); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><PencilIcon size={16} /></button>
                                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2Icon size={16} /></button>
                            </div>
                        ))}
                        {categories.length === 0 && <p className="text-sm text-slate-400">No categories yet.</p>}
                    </div>
                </div>
            )}
        </div>
    )
}
