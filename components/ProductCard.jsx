'use client'
import { StarIcon, ShoppingCartIcon, TruckIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useCurrency } from './useCurrency'
import { useDispatch } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import toast from 'react-hot-toast'
import { useLanguage } from './LanguageProvider'
import { useLocalized } from './useLocalized'

const ProductCard = ({ product }) => {

    const { format } = useCurrency()
    const { t } = useLanguage()
    const { text } = useLocalized()
    const dispatch = useDispatch()

    // calculate the average rating of the product
    const rating = product.rating?.length
        ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(addToCart({ productId: product.id }))
        toast.success(t('addedToCart'))
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.id],
                content_type: 'product',
                value: product.price,
                currency: 'USD',
            })
        }
    }

    return (
        <div className='group max-xl:mx-auto relative'>
            <Link href={`/product/${product.id}`} className='block'>
                <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center relative overflow-hidden'>
                    <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300' src={product.images?.[0] || '/assets/product_img1.png'} alt="" onError={(e) => { e.currentTarget.src = '/assets/product_img1.png' }} />

                    {/* Out of stock overlay */}
                    {product.inStock === false && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-xs font-medium px-4 py-1.5 rounded-full">{t('outOfStock')}</span>
                        </div>
                    )}

                    {/* Quick add to cart button (desktop hover only) */}
                    <button
                        onClick={handleAddToCart}
                        disabled={product.inStock === false}
                        className="hidden sm:flex absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white p-2.5 rounded-full shadow-lg hover:bg-green-600 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Add to cart"
                    >
                        <ShoppingCartIcon size={16} />
                    </button>

                    {/* Mobile always-visible add to cart */}
                    <button
                        onClick={handleAddToCart}
                        disabled={product.inStock === false}
                        className="sm:hidden absolute bottom-2 right-2 bg-slate-800 text-white p-2 rounded-full shadow disabled:opacity-40"
                        aria-label="Add to cart"
                    >
                        <ShoppingCartIcon size={14} />
                    </button>
                </div>
                <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                    <div>
                        {product.brand?.name && <p className="text-xs text-slate-400">{product.brand.name}</p>}
                        <p className="truncate max-w-36">{text(product.name, product.nameBn)}</p>
                        <div className='flex'>
                            {Array(5).fill('').map((_, index) => (
                                <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                            ))}
                        </div>
                    </div>
                    <p>{format(product.price)}</p>
                </div>
            </Link>

            {/* Free shipping badge */}
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 max-w-60">
                <TruckIcon size={12} />
                <span>{t('freeShippingOver')}</span>
            </div>
        </div>
    )
}

export default ProductCard
