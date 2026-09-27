'use client'
import { useState } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import { XIcon, UploadIcon } from "lucide-react"

export default function ProductImagesEditor({ images = [], thumbnails = [], onChange }) {
    const [uploading, setUploading] = useState(false)

    const handleFiles = async (files) => {
        if (!files?.length) return
        setUploading(true)
        try {
            const newImages = [...images]
            const newThumbs = [...(thumbnails || [])]
            for (const file of files) {
                const fd = new FormData()
                fd.append("file", file)
                const res = await fetch('/api/upload', { method: 'POST', body: fd })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Upload failed')
                newImages.push(data.url)
                newThumbs.push(data.thumb || data.url)
            }
            onChange({ images: newImages, thumbnails: newThumbs })
            toast.success('Image added')
        } catch (e) {
            toast.error(e.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const removeAt = (index) => {
        const newImages = images.filter((_, i) => i !== index)
        const newThumbs = (thumbnails || []).filter((_, i) => i !== index)
        onChange({ images: newImages, thumbnails: newThumbs })
    }

    const moveToFront = (index) => {
        if (index === 0) return
        const newImages = [...images]
        const newThumbs = [...(thumbnails || [])]
        const [img] = newImages.splice(index, 1)
        const [th] = newThumbs.splice(index, 1)
        newImages.unshift(img)
        newThumbs.unshift(th)
        onChange({ images: newImages, thumbnails: newThumbs })
    }

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-400">Product Images</span>
            <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 group">
                        <Image src={thumbnails?.[i] || img} alt="" fill className="object-contain p-1" unoptimized />
                        <button
                            type="button"
                            onClick={() => removeAt(i)}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                            title="Remove image"
                        >
                            <XIcon size={12} />
                        </button>
                        {i === 0 ? (
                            <span className="absolute bottom-0 left-0 bg-slate-800/80 text-white text-[9px] px-1.5 py-0.5">Main</span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => moveToFront(i)}
                                className="absolute bottom-0 left-0 right-0 bg-slate-800/70 text-white text-[9px] py-0.5 opacity-0 group-hover:opacity-100 transition"
                                title="Make main image"
                            >
                                Make main
                            </button>
                        )}
                    </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:border-slate-400 hover:text-slate-500">
                    <UploadIcon size={16} />
                    <span className="text-[10px] mt-1">{uploading ? '...' : 'Add'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={uploading}
                        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
                    />
                </label>
            </div>
            <p className="text-[11px] text-slate-400">First image is the main image. Recommended 800 × 900 px (8:9).</p>
        </div>
    )
}
