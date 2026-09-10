'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, TruckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Image from "next/image";
import Counter from "./Counter";
import ProductChatWidget from "./ProductChatWidget";
import { useDispatch, useSelector } from "react-redux";
import { useCurrency } from "./useCurrency";
import useStorefrontData from "./useStorefrontData";
import { useLanguage } from "./LanguageProvider";
import { useLocalized } from "./useLocalized";

const ProductDetails = ({ product }) => {

    const { format } = useCurrency();
    const { t } = useLanguage();
    const { text } = useLocalized();
    const { settings } = useStorefrontData();
    const fbSettings = settings.facebook || {};
    const storeSettings = product?.store || {};

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const router = useRouter();

    // Variant selection state
    const [selectedAttributes, setSelectedAttributes] = useState({})
    const [mainImage, setMainImage] = useState(product.images[0]);

    const hasVariants = product.hasVariants && product.variants?.length > 0
    const options = product.options || []

    // Find matching variant based on selected attributes
    const selectedVariant = useMemo(() => {
        if (!hasVariants) return null
        const selectedKeys = Object.keys(selectedAttributes)
        if (selectedKeys.length === 0) return null
        return product.variants.find(v => {
            return selectedKeys.every(key => v.attributes[key] === selectedAttributes[key])
        })
    }, [hasVariants, selectedAttributes, product.variants])

    // Determine display values
    const displayImage = selectedVariant?.image || mainImage
    const variantId = selectedVariant?.id || null

    // Price: selected variant price, or average of variants, or product price
    const displayPrice = (() => {
        if (selectedVariant) return selectedVariant.price
        if (hasVariants && product.variants.length > 0) {
            const prices = product.variants.map(v => v.price).filter(p => p > 0)
            return prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : product.price
        }
        return product.price
    })()

    const displayMrp = (() => {
        if (selectedVariant) return selectedVariant.mrp
        if (hasVariants && product.variants.length > 0) {
            const mrps = product.variants.map(v => v.mrp).filter(p => p > 0)
            return mrps.length > 0 ? Math.round(mrps.reduce((a, b) => a + b, 0) / mrps.length) : product.mrp
        }
        return product.mrp
    })()

    // When no variant selected and product has variants, show cumulative stock
    const displayStock = (() => {
        if (selectedVariant) return selectedVariant.stock
        if (hasVariants) return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        return product.stock
    })()

    const displayInStock = (() => {
        if (selectedVariant) return selectedVariant.inStock
        if (hasVariants) return product.variants.some(v => v.inStock && v.stock > 0)
        return product.inStock
    })()

    // Price range for variant products (when no variant selected)
    const priceRange = hasVariants && !selectedVariant && product.variants.length > 1 ? (() => {
        const prices = product.variants.map(v => v.price).filter(p => p > 0)
        return prices.length > 1 ? { min: Math.min(...prices), max: Math.max(...prices) } : null
    })() : null

    // Check if all options are selected
    const allSelected = hasVariants && options.every(opt => selectedAttributes[opt.name])

    // Check if current variant is in cart
    const cartKey = variantId ? `${product.id}:${variantId}` : product.id
    const inCart = cart[cartKey]

    const handleAttributeSelect = (optionName, value) => {
        setSelectedAttributes(prev => ({ ...prev, [optionName]: value }))
        // Try to find variant with new selection to update image
        const newAttrs = { ...selectedAttributes, [optionName]: value }
        if (hasVariants) {
            const match = product.variants.find(v =>
                Object.keys(newAttrs).every(key => v.attributes[key] === newAttrs[key])
            )
            if (match?.image) setMainImage(match.image)
        }
    }

    const addToCartHandler = () => {
        dispatch(addToCart({ productId: product.id, variantId }))
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.id],
                content_type: 'product',
                value: displayPrice,
                currency: 'USD',
            })
        }
    }

    const shareOnFacebook = () => {
        const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')
        const text = encodeURIComponent(product.name)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=500')
    }

    const orderViaMessenger = () => {
        const type = storeSettings.messengerType || "messenger"
        const customUrl = storeSettings.messengerUrl
        const pageId = fbSettings?.messengerPageId
        const pageUrl = fbSettings?.pageUrl
        const productUrl = typeof window !== 'undefined' ? window.location.href : ''
        const message = encodeURIComponent(`Hi! I would like to order "${product.name}" (${format(displayPrice)}) from theDhakaShop. Link: ${productUrl}`)

        let url = ""
        if (type === "whatsapp") {
            const num = customUrl.replace(/[^0-9]/g, '')
            url = `https://wa.me/${num}?text=${message}`
        } else if (type === "imo") {
            url = customUrl ? `https://imo.im/user/${customUrl}` : ""
        } else if (type === "custom") {
            url = customUrl || ""
        } else {
            url = pageId ? `https://m.me/${pageId}?text=${message}` : (customUrl || pageUrl || "")
        }
        if (url) window.open(url, '_blank')
    }

    const averageRating = product.rating?.length
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
        : 0;

    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {(product.images || []).map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} onError={(e) => { e.currentTarget.src = "/assets/product_img1.png" }} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <Image src={displayImage} alt="" width={250} height={250} onError={(e) => { e.currentTarget.src = "/assets/product_img1.png" }} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{text(product.name, product.nameBn)}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating?.length || 0} {t('reviews')}</p>
                </div>

                {/* Price display */}
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    {priceRange && !selectedVariant ? (
                        <>
                            <p>{format(priceRange.min)} - {format(priceRange.max)}</p>
                        </>
                    ) : (
                        <>
                            <p>{format(displayPrice)}</p>
                            {displayMrp > displayPrice && <p className="text-xl text-slate-500 line-through">{format(displayMrp)}</p>}
                        </>
                    )}
                </div>

                {displayMrp > displayPrice && (
                    <div className="flex items-center gap-2 text-slate-500">
                        <TagIcon size={14} />
                        <p>{t('savePercent')} {((displayMrp - displayPrice) / displayMrp * 100).toFixed(0)}% {t('rightNow')}</p>
                    </div>
                )}

                {/* Free delivery badge */}
                {(product.freeDelivery || Number(product.deliveryCost || 0) <= 0) && (
                    <div className="flex items-center gap-2 mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 w-fit">
                        <TruckIcon size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">Free Delivery</span>
                    </div>
                )}

                {/* Variant selectors */}
                {hasVariants && options.map((opt) => (
                    <div key={opt.name} className="mt-5">
                        <p className="text-sm font-medium text-slate-700 mb-2">{opt.name}: <span className="text-slate-500">{selectedAttributes[opt.name] || 'Select'}</span></p>
                        <div className="flex flex-wrap gap-2">
                            {opt.values.map((val) => {
                                const isSelected = selectedAttributes[opt.name] === val
                                // Check if this value combination is available
                                const isAvailable = product.variants.some(v => {
                                    const match = { ...selectedAttributes, [opt.name]: val }
                                    return Object.keys(match).every(key => v.attributes[key] === match[key]) && v.stock > 0
                                })
                                return (
                                    <button
                                        key={val}
                                        onClick={() => handleAttributeSelect(opt.name, val)}
                                        disabled={!isAvailable}
                                        className={`px-4 py-2 rounded-lg text-sm border transition ${isSelected ? 'border-slate-800 bg-slate-800 text-white' : isAvailable ? 'border-slate-200 text-slate-600 hover:border-slate-400' : 'border-slate-100 text-slate-300 cursor-not-allowed line-through'}`}
                                    >
                                        {val}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {/* Stock info */}
                <div className="mt-4">
                    {hasVariants && !selectedVariant ? (
                        displayStock > 0 ? (
                            <p className="text-sm text-green-600">In Stock ({displayStock} available across all variants)</p>
                        ) : (
                            <p className="text-sm text-red-500">Out of Stock</p>
                        )
                    ) : displayInStock && displayStock > 0 ? (
                        <p className="text-sm text-green-600">In Stock ({displayStock} available)</p>
                    ) : (
                        <p className="text-sm text-red-500">Out of Stock</p>
                    )}
                </div>

                {/* Add to cart */}
                <div className="flex flex-wrap items-end gap-3 mt-6">
                    {inCart && (
                        <div className="flex flex-col gap-3">
                            <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                            <Counter productId={product.id} variantId={variantId} />
                        </div>
                    )}
                    <button
                        onClick={() => !inCart ? addToCartHandler() : router.push('/cart')}
                        disabled={!displayInStock || (hasVariants && !allSelected)}
                        className="bg-slate-800 text-white px-6 py-2.5 text-sm font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {!inCart ? t('addToCart') : t('viewCart')}
                    </button>
                    {storeSettings.enableShare !== false && (
                        <button onClick={shareOnFacebook} className="flex items-center gap-1.5 bg-[#1877F2] text-white px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-[#1669d6] active:scale-95 transition whitespace-nowrap" aria-label="Share on Facebook">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            {t('share')}
                        </button>
                    )}
                    {storeSettings.enableMessenger !== false && (storeSettings.messengerUrl || fbSettings?.messengerPageId || fbSettings?.pageUrl) && (
                        <button onClick={orderViaMessenger} className={`flex items-center gap-1.5 text-white px-4 py-2.5 text-sm font-medium rounded-lg active:scale-95 transition whitespace-nowrap ${storeSettings.messengerType === 'whatsapp' ? 'bg-[#25D366] hover:bg-[#20bd5a]' : storeSettings.messengerType === 'imo' ? 'bg-[#2196F3] hover:bg-[#1976D2]' : 'bg-[#00B2FF] hover:bg-[#009add]'}`} aria-label="Order via Messenger">
                            {storeSettings.messengerType === 'whatsapp' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            ) : storeSettings.messengerType === 'imo' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-1-3H7l2-5h2l-1 3h3l-2 5h-2zm4-5h-2l1-3h-2l2-3h2l-1 3h2l-2 3z"/></svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.6 7.2V22l3.3-1.8c1 .3 2 .4 3.1.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm5.4 6.9l-2.7 4.3c-.4.6-1.2.7-1.8.3l-2.4-1.8-2.6 1.8c-.5.3-1.1-.1-.9-.7l2.7-4.3c.4-.6 1.2-.7 1.8-.3l2.4 1.8 2.6-1.8c.5-.3 1.1.1.9.7z"/></svg>
                            )}
                            {storeSettings.messengerType === 'whatsapp' ? 'WhatsApp' : t('orderOnMessenger')}
                        </button>
                    )}
                    <ProductChatWidget productId={product.id} storeId={product.storeId} />
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free shipping worldwide </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails
