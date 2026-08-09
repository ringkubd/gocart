'use client'
import { assets } from "@/assets/assets"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function StoreAddProduct() {

    const router = useRouter()

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Beauty & Health', 'Toys & Games', 'Sports & Outdoors', 'Books & Media', 'Food & Drink', 'Hobbies & Crafts', 'Others']

    const [brands, setBrands] = useState([])
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        category: "",
        brandId: "",
    })
    const [loading, setLoading] = useState(false)

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/brands')
            const data = await res.json()
            if (res.ok) setBrands(data.brands)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchBrands()
    }, [])

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

            toast.success('Product added')
            router.push('/store/manage-product')
        } catch (error) {
            toast.error(error.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className="text-slate-500 mb-28">
            <h1 className="text-2xl">Add New <span className="text-slate-800 font-medium">Products</span></h1>
            <p className="mt-7">Product Images</p>

            <div className="flex gap-3 mt-4">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-15 w-auto border border-slate-200 rounded cursor-pointer' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                        <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                    </label>
                ))}
            </div>

            <label className="flex flex-col gap-2 my-6 ">
                Name
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Enter product name" className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded" required />
            </label>

            <label className="flex flex-col gap-2 my-6 ">
                Description
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Enter product description" rows={5} className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none" required />
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

            <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded" required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                ))}
            </select>

            <select onChange={e => setProductInfo({ ...productInfo, brandId: e.target.value })} value={productInfo.brandId} className="w-full max-w-sm p-2 px-4 mb-2 outline-none border border-slate-200 rounded">
                <option value="">Select a brand (optional)</option>
                {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
            </select>

            <br />

            <button disabled={loading} className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition disabled:opacity-50">{loading ? 'Adding...' : 'Add Product'}</button>
        </form>
    )
}
