'use client'
import { useState } from "react"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import Image from "next/image"
import { useCurrency } from "./useCurrency"

export default function VariantBuilder({ options, variants, onChange }) {
    const { symbol: currency } = useCurrency()
    const [newOptionName, setNewOptionName] = useState('')
    const [valueInputs, setValueInputs] = useState({})

    const addOption = () => {
        if (!newOptionName.trim()) return
        const exists = options.find(o => o.name.toLowerCase() === newOptionName.trim().toLowerCase())
        if (exists) return
        onChange({
            options: [...options, { name: newOptionName.trim(), values: [] }],
            variants,
        })
        setNewOptionName('')
    }

    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index)
        const removedName = options[index].name
        const newVariants = variants.map(v => {
            const attrs = { ...v.attributes }
            delete attrs[removedName]
            return { ...v, attributes: attrs }
        }).filter(v => Object.keys(v.attributes).length === newOptions.length || newOptions.length === 0)
        onChange({ options: newOptions, variants: newVariants })
    }

    const handleValueInput = (optIndex, val) => {
        setValueInputs(prev => ({ ...prev, [optIndex]: val }))
    }

    const addValue = (optIndex) => {
        const val = (valueInputs[optIndex] || '').trim()
        if (!val) return
        const newOptions = [...options]
        if (newOptions[optIndex].values.includes(val)) return
        newOptions[optIndex] = { ...newOptions[optIndex], values: [...newOptions[optIndex].values, val] }
        onChange({ options: newOptions, variants })
        setValueInputs(prev => ({ ...prev, [optIndex]: '' }))
    }

    const removeValue = (optIndex, valIndex) => {
        const newOptions = [...options]
        newOptions[optIndex] = { ...newOptions[optIndex], values: newOptions[optIndex].values.filter((_, i) => i !== valIndex) }
        onChange({ options: newOptions, variants })
    }

    const generateVariants = () => {
        if (options.length === 0 || options.some(o => o.values.length === 0)) return
        const combinations = options.reduce((acc, opt) => {
            const result = []
            acc.forEach(combo => {
                opt.values.forEach(val => {
                    result.push({ ...combo, [opt.name]: val })
                })
            })
            return result
        }, [{}])

        const newVariants = combinations.map((attrs) => {
            const attrKey = Object.values(attrs).join('-')
            const existing = variants.find(v => {
                const vKey = Object.values(v.attributes).join('-')
                return vKey === attrKey
            })
            return {
                sku: existing?.sku || '',
                price: existing?.price || 0,
                mrp: existing?.mrp || 0,
                stock: existing?.stock || 0,
                image: existing?.image || '',
                attributes: attrs,
            }
        })
        onChange({ options, variants: newVariants })
    }

    const updateVariant = (index, field, value) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        onChange({ options, variants: newVariants })
    }

    const removeVariant = (index) => {
        onChange({ options, variants: variants.filter((_, i) => i !== index) })
    }

    const handleVariantImage = async (index, file) => {
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            updateVariant(index, 'image', data.url)
        } catch (error) {
            console.error('Upload failed')
        }
    }

    return (
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
            <h3 className="font-medium text-slate-700 mb-4">Product Variants</h3>

            {/* Option Groups */}
            <div className="space-y-4 mb-6">
                {options.map((opt, optIndex) => (
                    <div key={optIndex} className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">{opt.name}</span>
                                <span className="text-xs text-slate-400">({opt.values.length} values)</span>
                            </div>
                            <button type="button" onClick={() => removeOption(optIndex)} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2Icon size={14} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {opt.values.map((val, valIndex) => (
                                <span key={valIndex} className="flex items-center gap-1 bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-full">
                                    {val}
                                    <button type="button" onClick={() => removeValue(optIndex, valIndex)} className="text-slate-400 hover:text-red-500 ml-1">
                                        <XIcon size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={valueInputs[optIndex] || ''}
                                onChange={(e) => handleValueInput(optIndex, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue(optIndex) } }}
                                placeholder={`Add ${opt.name} value and press Enter`}
                                className="flex-1 border border-slate-200 rounded p-2 text-sm"
                            />
                            <button type="button" onClick={() => addValue(optIndex)} className="bg-slate-800 text-white px-3 py-2 rounded text-sm hover:bg-slate-900">
                                Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add new option */}
            <div className="flex gap-2 mb-4">
                <input
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                    placeholder="Option name (e.g. Color, Size, Storage)"
                    className="flex-1 border border-slate-200 rounded p-2 text-sm"
                />
                <button type="button" onClick={addOption} className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900 flex items-center gap-1">
                    <PlusIcon size={14} /> Add Option
                </button>
            </div>

            {/* Generate button */}
            {options.length > 0 && options.every(o => o.values.length > 0) && (
                <button type="button" onClick={generateVariants} className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 mb-4">
                    Generate {options.reduce((acc, o) => acc * o.values.length, 1)} Variants
                </button>
            )}

            {/* Variant Grid */}
            {variants.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-600 mb-3">Variants ({variants.length})</h4>
                    <div className="space-y-3">
                        {variants.map((variant, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-3 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(variant.attributes).map(([attr, val]) => (
                                            <span key={attr} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                                {attr}: {val}
                                            </span>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => removeVariant(index)} className="text-red-400 hover:text-red-600 p-1">
                                        <Trash2Icon size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">SKU</span>
                                        <input value={variant.sku} onChange={(e) => updateVariant(index, 'sku', e.target.value)} className="border border-slate-200 rounded p-2 text-sm" placeholder="SKU" />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Price ({currency})</span>
                                        <input type="number" value={variant.price || ''} onChange={(e) => updateVariant(index, 'price', Number(e.target.value))} className="border border-slate-200 rounded p-2 text-sm" placeholder="0" />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">MRP ({currency})</span>
                                        <input type="number" value={variant.mrp || ''} onChange={(e) => updateVariant(index, 'mrp', Number(e.target.value))} className="border border-slate-200 rounded p-2 text-sm" placeholder="0" />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Stock</span>
                                        <input type="number" value={variant.stock || ''} onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))} className="border border-slate-200 rounded p-2 text-sm" placeholder="0" />
                                    </label>
                                    <label className="flex flex-col gap-1">
                                        <span className="text-xs text-slate-400">Image</span>
                                        <div className="flex items-center gap-2">
                                            {variant.image && <Image src={variant.image} width={32} height={32} className="rounded object-cover h-8 w-8" alt="" />}
                                            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handleVariantImage(index, e.target.files[0]) }} className="text-xs" />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
