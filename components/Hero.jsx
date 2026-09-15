'use client'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import useStorefrontData from './useStorefrontData'
import { useLanguage } from './LanguageProvider'

const Hero = () => {

    const { slides, settings } = useStorefrontData()
    const { t } = useLanguage()
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
                <div className='relative flex-1 rounded-3xl xl:min-h-100 group overflow-hidden bg-slate-800'>
                    {loaded ? (
                        <>
                            {/* Full-bleed background image */}
                            {slides[current]?.image && (
                                <Image
                                    src={slides[current].image}
                                    alt=""
                                    fill
                                    priority={current === 0}
                                    className="object-cover object-center transition-opacity duration-700"
                                />
                            )}
                            {/* Text overlay for readability */}
                            <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10'></div>

                            {/* Content on top */}
                            <div className='relative z-10 flex flex-col justify-center h-full p-6 sm:p-12 xl:p-16'>
                                {slides[current]?.title && (
                                    <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium text-white max-w-xs sm:max-w-md drop-shadow-lg'>
                                        {slides[current].title}
                                    </h2>
                                )}
                                {slides[current]?.subtitle && (
                                    <div className='text-white/90 text-sm font-medium mt-2 sm:mt-4 max-w-md drop-shadow'>
                                        <p>{slides[current].subtitle}</p>
                                    </div>
                                )}
                                {(slides[current]?.buttonText || slides[current]?.link) && (
                                    <Link href={slides[current]?.link || '/shop'} className='w-fit bg-white text-slate-900 text-sm py-2.5 px-7 sm:py-4 sm:px-10 mt-4 sm:mt-8 rounded-md hover:bg-slate-100 hover:scale-103 active:scale-95 transition inline-flex items-center gap-2 font-medium'>
                                        {slides[current]?.buttonText || t('shopNow')} <ArrowRightIcon size={16} />
                                    </Link>
                                )}
                            </div>

                            {/* Slide navigation */}
                            {slides.length > 1 && (
                                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2'>
                                    {slides.map((_, i) => (
                                        <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'}`} />
                                    ))}
                                </div>
                            )}

                            {/* Prev/Next arrows */}
                            {slides.length > 1 && (
                                <>
                                    <button onClick={() => go(-1)} aria-label="Previous slide" className='absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition'>
                                        <ChevronLeftIcon size={20} />
                                    </button>
                                    <button onClick={() => go(1)} aria-label="Next slide" className='absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition'>
                                        <ChevronRightIcon size={20} />
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className='flex items-center justify-center h-64 sm:h-100'>
                            <div className='w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin'></div>
                        </div>
                    )}
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    {(settings.heroSideCards || []).filter(c => c.active !== false).map((card, i) => (
                        <Link key={i} href={card.link || '/shop'} className={`flex-1 flex items-center justify-between w-full ${card.bgColor || 'bg-orange-200'} rounded-3xl p-6 px-8 group`}>
                            <div>
                                <p className={`text-3xl font-medium bg-gradient-to-r from-slate-800 to-[${card.gradientTo || '#FFAD51'}] bg-clip-text text-transparent max-w-40`}>{card.title}</p>
                                <p className='flex items-center gap-1 mt-4'>View more <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                            </div>
                            {card.image && <Image className='w-35' src={card.image} alt="" width={140} height={140} />}
                        </Link>
                    ))}
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero
