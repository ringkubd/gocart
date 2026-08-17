'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/LanguageProvider"

export default function StoreAddProduct() {

    const router = useRouter()
    const { t } = useLanguage()

    const [categories, setCategories] = useState([])
    const [brands, setBrands] = useState([])
    const [showNewBrand, setShowNewBrand] = useState(false)
    const [showNewCategory, setShowNewCategory] = useState(false)
    const [newBrandName, setNewBrandName] = useState('')
    const [newCatName, setNewCatName] = useState('')
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        nameBn: "",
        description: "",
        descriptionBn: "",
        mrp: 0,
        price: 0,
        category: "",
        categoryBn: "",
        brandId: "",
    })
    const [loading, setLoading] = useState(false)

    const fetchBrands = async () => {
        try {
            const [brandsRes, catsRes] = await Promise.all([
                fetch('/api/store/brands'),
                fetch('/api/store/categories'),
            ])
            const brandsData = await brandsRes.json()
            const catsData = await catsRes.json()
            if (brandsRes.ok) setBrands(brandsData.brands)
            if (catsRes.ok) setCategories(catsData.categories)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchBrands()
    }, [])

    const createInlineBrand = async () => {
        if (!newBrandName.trim()) return
        try {
            const res = await fetch('/api/store/brands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newBrandName.trim() }),
            })
            const data = await res.json()
            if (res.ok && data.brand) {
                if (!brands.find(b => b.id === data.brand.id)) {
                    setBrands(prev => [...prev, data.brand])
                }
                setProductInfo({ ...productInfo, brandId: data.brand.id })
                setNewBrandName('')
                setShowNewBrand(false)
                toast.success('Brand created')
            }
        } catch (error) {
            toast.error('Failed to create brand')
        }
    }

    const createInlineCategory = async () => {
        if (!newCatName.trim()) return
        try {
            const res = await fetch('/api/store/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCatName.trim() }),
            })
            const data = await res.json()
            if (res.ok && data.category) {
                if (!categories.find(c => c.id === data.category.id)) {
                    setCategories(prev => [...prev, data.category])
                }
                setProductInfo({ ...productInfo, category: data.category.name })
                setNewCatName('')
                setShowNewCategory(false)
                toast.success('Category created')
            }
        } catch (error) {
            toast.error('Failed to create category')
        }
    }

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)

        try {
            const uploadedImages = []
            for (const key of Object.keys(images)) {
                const file = images[key]
                if (file) {
                    const fd = new FormData()
                    fd.append("file", file)
                    const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
                    const upData = await upRes.json()
                    if (!upRes.ok) throw new Error(upData.error || 'Image upload failed')
                    uploadedImages.push(upData.url)
                }
            }

            if (uploadedImages.length === 0) {
                throw new Error('Please upload at least one product image')
            }

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...productInfo, images: uploadedImages, mrp: Number(productInfo.mrp), price: Number(productInfo.price) }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add product')
            }

            toast.success(t('productAdded'))
            router.push('/store/manage-product')
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
            <h1 className="text-2xl">{t('addProduct')}</h1>
            <p className="mt-7">{t('productImages')}</p>

            <div className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                        <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                    </label>
                ))}
            </div>

            <label className="flex flex-col gap-2 my-6 ">
                {t('name')} (English)
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label className="flex flex-col gap-2 my-6 ">
                {t('name')} (বাংলা)
                <input type="text" name="nameBn" onChange={onChangeHandler} value={productInfo.nameBn} placeholder="পণ্যের নাম লিখুন" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" />
            </label>

            <label className="flex flex-col gap-2 my-6 ">
                {t('description')} (English)
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
            </label>

            <label className="flex flex-col gap-2 my-6 ">
                {t('description')} (বাংলা)
                <textarea name="descriptionBn" onChange={onChangeHandler} value={productInfo.descriptionBn} placeholder="পণ্যের বিবরণ লিখুন" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" />
            </label>

            <div className="flex gap-5">
                <label className="flex flex-col gap-2 ">
                    Actual Price ($)
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
                <label className="flex flex-col gap-2 ">
                    Offer Price ($)
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="0" className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
                </label>
            </div>

            <div className="w-full max-w-sm mb-2">
                <label className="text-xs text-slate-400 mb-1 block">Category</label>
                {showNewCategory ? (
                    <div className="flex gap-2">
                        <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New category name" className="flex-1 p-2 px-3 border border-slate-200 rounded text-sm" autoFocus />
                        <button type="button" onClick={createInlineCategory} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">Add</button>
                        <button type="button" onClick={() => { setShowNewCategory(false); setNewCatName('') }} className="text-sm text-slate-400 px-2">Cancel</button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <select onChange={e => {
                            const cat = categories.find(c => c.name === e.target.value)
                            setProductInfo({ ...productInfo, category: e.target.value, categoryBn: cat?.nameBn || "" })
                        }} value={productInfo.category} className="flex-1 p-2 px-3 outline-none border border-slate-200 rounded text-sm" required>
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                        <button type="button" onClick={() => setShowNewCategory(true)} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 whitespace-nowrap" title="Add new category">+ Add</button>
                    </div>
                )}
            </div>

            <div className="w-full max-w-sm mb-2">
                <label className="text-xs text-slate-400 mb-1 block">Brand (optional)</label>
                {showNewBrand ? (
                    <div className="flex gap-2">
                        <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="New brand name" className="flex-1 p-2 px-3 border border-slate-200 rounded text-sm" autoFocus />
                        <button type="button" onClick={createInlineBrand} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">Add</button>
                        <button type="button" onClick={() => { setShowNewBrand(false); setNewBrandName('') }} className="text-sm text-slate-400 px-2">Cancel</button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <select onChange={e => setProductInfo({ ...productInfo, brandId: e.target.value })} value={productInfo.brandId} className="flex-1 p-2 px-3 outline-none border border-slate-200 rounded text-sm">
                            <option value="">Select a brand</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                        <button type="button" onClick={() => setShowNewBrand(true)} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 whitespace-nowrap" title="Add new brand">+ Add</button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Delivery Cost (per item)</span>
                    <input type="number" name="deliveryCost" onChange={onChangeHandler} value={productInfo.deliveryCost} placeholder="0" className="p-2 px-4 outline-none border border-slate-200 rounded text-sm" />
                </label>
                <label className="flex items-center gap-2 mt-5">
                    <input type="checkbox" checked={productInfo.freeDelivery} onChange={(e) => setProductInfo({ ...productInfo, freeDelivery: e.target.checked })} className="accent-green-500" />
                    <span className="text-sm">Free Delivery</span>
                </label>
            </div>

            {!productInfo.freeDelivery && (
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Min Qty for Free Delivery</span>
                        <input type="number" name="minQtyForFree" onChange={onChangeHandler} value={productInfo.minQtyForFree} placeholder="0" className="p-2 px-4 outline-none border border-slate-200 rounded text-sm" />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-slate-400">Delivery Discount %</span>
                        <input type="number" name="deliveryDiscount" onChange={onChangeHandler} value={productInfo.deliveryDiscount} placeholder="0" className="p-2 px-4 outline-none border border-slate-200 rounded text-sm" />
                    </label>
                </div>
            )}

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-50">{loading ? t('loading') : t('addProduct')}</button>
        </form>
    )
}
