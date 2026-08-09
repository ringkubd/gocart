'use client'
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"
import { StarIcon, Trash2Icon, EyeIcon, EyeOffIcon } from "lucide-react"

export default function AdminReviews() {

    const [ratings, setRatings] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchReviews = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            const res = await fetch(`/api/admin/reviews?${params.toString()}`)
            const data = await res.json()
            if (res.ok) setRatings(data.ratings)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const toggleHidden = async (rating) => {
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: rating.id, hidden: !rating.hidden }),
            })
            if (!res.ok) throw new Error('Failed')
            setRatings(prev => prev.map(r => r.id === rating.id ? { ...r, hidden: !rating.hidden } : r))
            toast.success(rating.hidden ? 'Review shown' : 'Review hidden')
        } catch (error) {
            toast.error('Failed')
        }
    }

    const handleDelete = async (rating) => {
        if (!confirm('Delete this review?')) return
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: rating.id }),
            })
            if (!res.ok) throw new Error('Failed')
            setRatings(prev => prev.filter(r => r.id !== rating.id))
            toast.success('Review deleted')
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [])

    if (loading && ratings.length === 0) return <Loading />

    return (
        <div className="text-slate-500 mb-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl">Review <span className="text-slate-800 font-medium">Management</span></h1>
                <form onSubmit={(e) => { e.preventDefault(); fetchReviews() }} className="flex gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews" className="border border-slate-200 outline-slate-400 p-2 rounded text-sm w-60" />
                    <button className="bg-slate-700 text-white px-4 rounded text-sm">Search</button>
                </form>
            </div>

            <div className="mt-6 flex flex-col gap-3 max-w-4xl">
                {ratings.map((rating) => (
                    <div key={rating.id} className={`border rounded-xl p-5 ${rating.hidden ? 'border-slate-200 opacity-60' : 'border-slate-200'}`}>
                        <div className="flex items-start gap-4">
                            <Image src={rating.user?.image || '/assets/profile_pic1.jpg'} width={44} height={44} className="rounded-full h-11 w-11 object-cover" alt="" />
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-slate-700">{rating.user?.name}</p>
                                    <span className="text-xs text-slate-400">{new Date(rating.createdAt).toLocaleString()}</span>
                                    <span className="flex items-center">
                                        {Array(5).fill('').map((_, i) => (
                                            <StarIcon key={i} size={14} className="text-transparent" fill={rating.rating >= i + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </span>
                                    {rating.hidden && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Hidden</span>}
                                </div>
                                <p className="text-sm text-slate-500 mt-2">{rating.review}</p>
                                <div className="flex items-center gap-2 mt-3 text-xs">
                                    <Image src={rating.product?.images?.[0] || '/assets/product_img1.png'} width={24} height={24} className="rounded h-6 w-6 object-cover" alt="" />
                                    <span className="text-slate-400">on <span className="text-slate-600 font-medium">{rating.product?.name}</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleHidden(rating)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title={rating.hidden ? 'Show' : 'Hide'}>
                                    {rating.hidden ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />}
                                </button>
                                <button onClick={() => handleDelete(rating)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                                    <Trash2Icon size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {ratings.length === 0 && <p className="text-sm text-slate-400">No reviews found.</p>}
            </div>
        </div>
    )
}
