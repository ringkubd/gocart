'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminSeo() {

    const [loading, setLoading] = useState(true)
    const [seoPages, setSeoPages] = useState([])
    const [pageLabels, setPageLabels] = useState({})
    const [global, setGlobal] = useState({})
    const [selected, setSelected] = useState(null)
    const [globalForm, setGlobalForm] = useState({})
    const [aiCrawlers, setAiCrawlers] = useState({})
    const [seoRobots, setSeoRobots] = useState("index")
    const [googleConfig, setGoogleConfig] = useState({ merchantId: '', googleVerification: '', analyticsId: '', measurementId: '' })

    const AI_CRAWLERS = [
        { key: 'gptbot', name: 'GPTBot (OpenAI)' },
        { key: 'chatgpt', name: 'ChatGPT-User' },
        { key: 'claudebot', name: 'ClaudeBot (Anthropic)' },
        { key: 'claudecrawler', name: 'Claude-Web' },
        { key: 'anthropic', name: 'anthropic-ai' },
        { key: 'googleextended', name: 'Google-Extended' },
        { key: 'perplexity', name: 'PerplexityBot' },
        { key: 'openai', name: 'OAI-SearchBot' },
        { key: 'bytespider', name: 'Bytespider (TikTok)' },
        { key: 'bingai', name: 'BingBot' },
        { key: 'metaai', name: 'meta-externalagent' },
    ]

    const fetchSeo = async () => {
        try {
            const res = await fetch('/api/admin/seo')
            const data = await res.json()
            if (res.ok) {
                setSeoPages(data.seoPages)
                setPageLabels(data.pageLabels)
                setGlobal(data.global)
                setAiCrawlers(data.aiCrawlers || {})
                setSeoRobots(data.seoRobots || "index")
                setGoogleConfig(data.googleConfig || { merchantId: '', googleVerification: '', analyticsId: '', measurementId: '' })
                setGlobalForm({
                    seoDescription: data.global.description,
                    seoKeywords: data.global.keywords,
                    seoOgImage: data.global.ogImage,
                })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const saveAiSettings = async (e) => {
        e.preventDefault()
        try {
            await fetch('/api/admin/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'aiCrawlers', value: aiCrawlers }),
            })
            await fetch('/api/admin/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'seoRobots', value: seoRobots }),
            })
            toast.success('AI & crawler settings saved')
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const saveGoogleConfig = async (e) => {
        e.preventDefault()
        try {
            await fetch('/api/admin/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'googleConfig', value: googleConfig }),
            })
            toast.success('Google settings saved')
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const saveGlobal = async (e) => {
        e.preventDefault()
        try {
            await fetch('/api/admin/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'seoDescription', value: globalForm.seoDescription }),
            })
            await fetch('/api/admin/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'seoKeywords', value: globalForm.seoKeywords }),
            })
            await fetch('/api/admin/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'seoOgImage', value: globalForm.seoOgImage }),
            })
            toast.success('Global SEO saved')
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const savePage = async (e) => {
        e.preventDefault()
        if (!selected) return
        try {
            const res = await fetch('/api/admin/seo', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selected),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed')
            toast.success('SEO updated')
            fetchSeo()
        } catch (error) {
            toast.error(error.message || 'Failed')
        }
    }

    useEffect(() => {
        fetchSeo()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <h1 className="text-2xl">SEO <span className="text-slate-800 font-medium">Management</span></h1>
            <p className="text-sm text-slate-400 mt-1">Control meta titles, descriptions and keywords for each page.</p>

            {/* Global SEO */}
            <form onSubmit={saveGlobal} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-2xl flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Global SEO (fallback for all pages)</h3>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Meta Description</span>
                    <textarea value={globalForm.seoDescription || ''} onChange={(e) => setGlobalForm({ ...globalForm, seoDescription: e.target.value })} rows={2} className="border border-slate-200 rounded p-2 text-sm resize-none" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Keywords (comma separated)</span>
                    <input value={globalForm.seoKeywords || ''} onChange={(e) => setGlobalForm({ ...globalForm, seoKeywords: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Default OG Image URL (absolute, e.g. https://thedhakashop.com/assets/hero_product_img1.png)</span>
                    <input value={globalForm.seoOgImage || ''} onChange={(e) => setGlobalForm({ ...globalForm, seoOgImage: e.target.value })} className="border border-slate-200 rounded p-2 text-sm" />
                </label>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Global SEO</button>
            </form>

            {/* AI & Crawlers */}
            <form onSubmit={saveAiSettings} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-2xl flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">AI & Search Crawlers</h3>
                <p className="text-xs text-slate-400 -mt-2">
                    Control whether AI engines (ChatGPT, Claude, Perplexity, etc.) and search crawlers can access your site. Files <code className="bg-slate-100 px-1 rounded">/robots.txt</code>, <code className="bg-slate-100 px-1 rounded">/llms.txt</code> and <code className="bg-slate-100 px-1 rounded">/sitemap.xml</code> are auto-generated.
                </p>

                <label className="flex flex-col gap-1 max-w-xs">
                    <span className="text-xs text-slate-400">Site Indexing (all crawlers)</span>
                    <select value={seoRobots} onChange={(e) => setSeoRobots(e.target.value)} className="border border-slate-200 rounded p-2 text-sm">
                        <option value="index">Allow indexing</option>
                        <option value="noindex">Block indexing entirely</option>
                    </select>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AI_CRAWLERS.map((crawler) => (
                        <label key={crawler.key} className="flex items-center gap-2 text-sm border border-slate-100 rounded-lg p-2.5">
                            <input
                                type="checkbox"
                                checked={aiCrawlers[crawler.key] !== 'disallow'}
                                onChange={(e) => setAiCrawlers({ ...aiCrawlers, [crawler.key]: e.target.checked ? 'allow' : 'disallow' })}
                                className="accent-green-500"
                            />
                            <span className="text-slate-600">{crawler.name}</span>
                        </label>
                    ))}
                </div>

                {/* Sitemap status */}
                <div className="border border-slate-100 rounded-lg p-4 text-xs text-slate-500">
                    <p className="font-medium text-slate-600 mb-2">Auto-generated files</p>
                    <ul className="space-y-1">
                        <li>→ <a href="https://thedhakashop.com/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">sitemap.xml</a> (index)</li>
                        <li>→ <a href="https://thedhakashop.com/sitemap/products.xml" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">sitemap/products.xml</a> (product-wise, auto)</li>
                        <li>→ <a href="https://thedhakashop.com/sitemap/categories.xml" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">sitemap/categories.xml</a></li>
                        <li>→ <a href="https://thedhakashop.com/sitemap/stores.xml" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">sitemap/stores.xml</a></li>
                        <li>→ <a href="https://thedhakashop.com/sitemap/pages.xml" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">sitemap/pages.xml</a></li>
                        <li>→ <a href="https://thedhakashop.com/robots.txt" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">robots.txt</a> · <a href="https://thedhakashop.com/llms.txt" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">llms.txt</a></li>
                    </ul>
                </div>

                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save AI & Crawler Settings</button>
            </form>

            {/* Google Merchant Center & Search Console */}
            <form onSubmit={saveGoogleConfig} className="mt-6 border border-slate-200 rounded-xl p-6 max-w-2xl flex flex-col gap-4">
                <h3 className="font-medium text-slate-700">Google (Merchant Center & Search Console)</h3>
                <p className="text-xs text-slate-400 -mt-2">
                    Product feed for Google Shopping is auto-generated at <code className="bg-slate-100 px-1 rounded">/feed/google.xml</code>. Add your Merchant Center ID, Google verification token and Analytics/GTM IDs below.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Google Merchant Center ID</span>
                        <input value={googleConfig.merchantId || ''} onChange={(e) => setGoogleConfig({ ...googleConfig, merchantId: e.target.value })} placeholder="e.g. 123456789" className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Google Search Console Verification Token</span>
                        <input value={googleConfig.googleVerification || ''} onChange={(e) => setGoogleConfig({ ...googleConfig, googleVerification: e.target.value })} placeholder="google-site-verification code" className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Google Analytics 4 Measurement ID (G-XXXX)</span>
                        <input value={googleConfig.measurementId || ''} onChange={(e) => setGoogleConfig({ ...googleConfig, measurementId: e.target.value })} placeholder="G-XXXXXXXXXX" className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Google Analytics ID (UA-XXXX) [legacy]</span>
                        <input value={googleConfig.analyticsId || ''} onChange={(e) => setGoogleConfig({ ...googleConfig, analyticsId: e.target.value })} placeholder="UA-XXXX" className="border border-slate-200 rounded p-2 text-sm" />
                    </label>
                </div>
                <div className="border border-slate-100 rounded-lg p-4 text-xs text-slate-500">
                    <p className="font-medium text-slate-600 mb-2">Your Google Shopping feed URL</p>
                    <p>→ <a href="https://thedhakashop.com/feed/google.xml" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline break-all">https://thedhakashop.com/feed/google.xml</a></p>
                    <p className="mt-1">Paste this URL in Google Merchant Center → Products → Feeds.</p>
                </div>
                <button className="bg-slate-800 text-white px-6 py-2 rounded text-sm w-fit">Save Google Settings</button>
            </form>

            {/* Page list */}
            <div className="mt-8 max-w-2xl">
                <h3 className="font-medium text-slate-700 mb-3">Per-Page SEO</h3>
                <div className="flex flex-col gap-2">
                    {seoPages.map((page) => (
                        <div key={page.page} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700 text-sm">{pageLabels[page.page] || page.page}</p>
                                <p className="text-xs text-slate-400 truncate max-w-md">{page.title}</p>
                            </div>
                            <button onClick={() => setSelected(page)} className="text-sm text-green-600 hover:text-green-700">Edit</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit modal */}
            {selected && (
                <div onClick={() => setSelected(null)} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-slate-700 text-sm">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">Edit SEO — {pageLabels[selected.page] || selected.page}</h2>
                        <form onSubmit={savePage} className="flex flex-col gap-3">
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Meta Title</span>
                                <input value={selected.title} onChange={(e) => setSelected({ ...selected, title: e.target.value })} className="border border-slate-200 rounded p-2" required />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Meta Description</span>
                                <textarea value={selected.description} onChange={(e) => setSelected({ ...selected, description: e.target.value })} rows={3} className="border border-slate-200 rounded p-2" />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Keywords</span>
                                <input value={selected.keywords} onChange={(e) => setSelected({ ...selected, keywords: e.target.value })} className="border border-slate-200 rounded p-2" />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">OG Image URL</span>
                                <input value={selected.ogImage} onChange={(e) => setSelected({ ...selected, ogImage: e.target.value })} className="border border-slate-200 rounded p-2" placeholder="https://thedhakashop.com/..." />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-xs text-slate-400">Robots</span>
                                <select value={selected.robots} onChange={(e) => setSelected({ ...selected, robots: e.target.value })} className="border border-slate-200 rounded p-2">
                                    <option value="index, follow">index, follow</option>
                                    <option value="noindex, nofollow">noindex, nofollow</option>
                                </select>
                            </label>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">Cancel</button>
                                <button className="px-5 py-2 bg-slate-800 text-white rounded hover:bg-slate-900">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
