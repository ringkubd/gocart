'use client'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import useStorefrontData from './useStorefrontData'
import { useCurrency } from './useCurrency'

const Hero = () => {

    const { slides, settings } = useStorefrontData()
    const { format } = useCurrency()
    const [current, setCurrent] = useState(0)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (slides?.length > 0) {
            setLoaded(true)
        }
    }, [slides])

    useEffect(() => {
        if (!loaded || slides.length <= 1) return
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [loaded, slides.length])

    const go = (dir) => {
        setCurrent(prev => (prev + dir + slides.length) % slides.length)
    }

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-green-200 rounded-3xl xl:min-h-100 group overflow-hidden'>
                    {loaded ? (
                        <>
                            <div className='p-5 sm:p-16'>
                                <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-xs  sm:max-w-md'>
                                    {slides[current]?.title || "Gadgets you'll love. Prices you'll trust."}
                                </h2>
                                {slides[current]?.subtitle && (
                                    <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8 max-w-md'>
                                        <p>{slides[current].subtitle}</p>
                                    </div>
                                )}
                                <Link href={slides[current]?.link || '/shop'} className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition inline-flex items-center gap-2'>
                                    {slides[current]?.buttonText || 'Shop Now'} <ArrowRightIcon size={16} />
                                </Link>
                            </div>
                            {slides[current]?.image && (
                                <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm' src={slides[current].image} alt="" width={400} height={400} />
                            )}

                            {/* Slide navigation */}
                            {slides.length > 1 && (
                                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2'>
                                    {slides.map((_, i) => (
                                        <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-slate-800' : 'w-2 bg-slate-400/60'}`} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className='p-5 sm:p-16'>
                                <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-slate-600 to-[#A0FF74] bg-clip-text text-transparent max-w-xs  sm:max-w-md'>
                                    Gadgets you'll love. Prices you'll trust.
                                </h2>
                                <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
                                    <p>Starts from</p>
                                    <p className='text-3xl'>{format(4.9)}</p>
                                </div>
                                <Link href='/shop' className='bg-slate-800 text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 mt-4 sm:mt-10 rounded-md hover:bg-slate-900 hover:scale-103 active:scale-95 transition inline-flex items-center gap-2'>SHOP NOW <ArrowRightIcon size={16} /></Link>
                            </div>
                            <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm' src="/assets/hero_model_img.png" alt="" width={400} height={400} />
                        </>
                    )}
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <Link href='/shop' className='flex-1 flex items-center justify-between w-full bg-orange-200 rounded-3xl p-6 px-8 group'>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#FFAD51] bg-clip-text text-transparent max-w-40'>Best products</p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35' src="/assets/hero_product_img1.png" alt="" width={140} height={140} />
                    </Link>
                    <Link href='/shop' className='flex-1 flex items-center justify-between w-full bg-blue-200 rounded-3xl p-6 px-8 group'>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-[#78B2FF] bg-clip-text text-transparent max-w-40'>20% discounts</p>
                            <p className='flex items-center gap-1 mt-4'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35' src="/assets/hero_product_img2.png" alt="" width={140} height={140} />
                    </Link>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero
