'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import { useCurrency } from "./useCurrency";
import useStorefrontData from "./useStorefrontData";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const { format } = useCurrency();
    const { settings } = useStorefrontData();
    const fbSettings = settings.facebook || {};

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const router = useRouter()

    const [mainImage, setMainImage] = useState(product.images[0]);

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [productId],
                content_type: 'product',
                value: product.price,
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
        const pageId = fbSettings?.messengerPageId
        const pageUrl = fbSettings?.pageUrl
        const message = encodeURIComponent(`Hi! I would like to order "${product.name}" (${format(product.price)}) from theDhakaShop. Link: ${typeof window !== 'undefined' ? window.location.href : ''}`)
        const url = pageId ? `https://m.me/${pageId}?text=${message}` : pageUrl
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
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <Image src={mainImage} alt="" width={250} height={250} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating?.length || 0} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {format(product.price)} </p>
                    <p className="text-xl text-slate-500 line-through">{format(product.mrp)}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                </div>
                <div className="flex items-end gap-5 mt-10">
                    {
                        cart[productId] && (
                            <div className="flex flex-col gap-3">
                                <p className="text-lg text-slate-800 font-semibold">Quantity</p>
                                <Counter productId={productId} />
                            </div>
                        )
                    }
                    <button onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')} className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition">
                        {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                    </button>
                    <button onClick={shareOnFacebook} className="flex items-center gap-2 bg-[#1877F2] text-white px-5 py-3 text-sm font-medium rounded hover:bg-[#1669d6] active:scale-95 transition" aria-label="Share on Facebook">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Share
                    </button>
                    {(fbSettings?.messengerPageId || fbSettings?.pageUrl) && (
                        <button onClick={orderViaMessenger} className="flex items-center gap-2 bg-[#00B2FF] text-white px-5 py-3 text-sm font-medium rounded hover:bg-[#009add] active:scale-95 transition" aria-label="Order via Messenger">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.477 2 2 6.1 2 11.2c0 2.9 1.4 5.5 3.6 7.2V22l3.3-1.8c1 .3 2 .4 3.1.4 5.5 0 10-4.1 10-9.2S17.5 2 12 2zm5.4 6.9l-2.7 4.3c-.4.6-1.2.7-1.8.3l-2.4-1.8-2.6 1.8c-.5.3-1.1-.1-.9-.7l2.7-4.3c.4-.6 1.2-.7 1.8-.3l2.4 1.8 2.6-1.8c.5-.3 1.1.1.9.7z" />
                            </svg>
                            Order on Messenger
                        </button>
                    )}
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