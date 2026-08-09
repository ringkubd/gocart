'use client'
import { ArrowRight, StarIcon, TruckIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import useStorefrontData from "./useStorefrontData"
import { useCurrency } from "./useCurrency"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')
    const { shippingMethods } = useStorefrontData()
    const { format } = useCurrency()

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Shipping Info', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <div className="max-w-xl">
                    <p>{product.description}</p>
                    {product.brand?.name && (
                        <p className="mt-4 text-slate-400">Brand: <span className="text-slate-600 font-medium">{product.brand.name}</span></p>
                    )}
                </div>
            )}

            {/* Shipping Info */}
            {selectedTab === "Shipping Info" && (
                <div className="max-w-xl">
                    <div className="flex items-center gap-2 text-slate-500 mb-3">
                        <TruckIcon size={16} /> Delivery Information
                    </div>
                    {shippingMethods.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {shippingMethods.map((method) => (
                                <div key={method.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                                    <div>
                                        <p className="font-medium text-slate-700">{method.name}</p>
                                        <p className="text-xs text-slate-400">Delivery in {method.deliveryTime}</p>
                                    </div>
                                    <p className="font-medium text-slate-700">{method.cost > 0 ? format(method.cost) : 'Free'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400">Free shipping across the country.</p>
                    )}
                </div>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    {(product.rating || []).map((item, index) => (
                        <div key={index} className="flex gap-5 mb-10">
                            <Image src={item.user?.image || '/assets/profile_pic1.jpg'} alt="" className="size-10 rounded-full" width={100} height={100} />
                            <div>
                                <div className="flex items-center" >
                                    {Array(5).fill('').map((_, i) => (
                                        <StarIcon key={i} size={18} className='text-transparent mt-0.5' fill={item.rating >= i + 1 ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                                <p className="text-sm max-w-lg my-4">{item.review}</p>
                                <p className="font-medium text-slate-800">{item.user?.name}</p>
                                <p className="mt-3 font-light">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    ))}
                    {(!product.rating || product.rating.length === 0) && (
                        <p className="text-slate-400">No reviews yet. Be the first to review!</p>
                    )}
                </div>
            )}

            {/* Store Page */}
            {product.store && (
                <div className="flex gap-3 mt-14">
                    <Image src={product.store.logo || '/assets/happy_store.webp'} alt="" className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
                    <div>
                        <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                        <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription
