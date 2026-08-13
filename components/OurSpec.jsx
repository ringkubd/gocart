'use client'
import React from 'react'
import Title from './Title'
import { TruckIcon, ShieldCheckIcon, HeadphonesIcon, RefreshCcwIcon, BadgePercentIcon, PackageCheckIcon } from 'lucide-react'
import useStorefrontData from './useStorefrontData'
import { useLanguage } from './LanguageProvider'

const iconMap = {
    truck: TruckIcon,
    shield: ShieldCheckIcon,
    support: HeadphonesIcon,
    returns: RefreshCcwIcon,
    discount: BadgePercentIcon,
    package: PackageCheckIcon,
}

const defaultSpecs = [
    { title: 'Free & Fast Delivery', description: 'Free shipping on orders over a threshold, delivered quickly across Bangladesh.', icon: 'truck', accent: '#16a34a' },
    { title: 'Secure Payments', description: 'Cash on delivery, bKash, Nagad and more — your payments are safe with us.', icon: 'shield', accent: '#2563eb' },
    { title: '24/7 Support', description: 'Our support team is here to help you anytime via live chat and tickets.', icon: 'support', accent: '#9333ea' },
]

const OurSpecs = () => {

    const { settings } = useStorefrontData()
    const { t } = useLanguage()
    const specs = (settings.ourSpecs && settings.ourSpecs.length > 0) ? settings.ourSpecs : defaultSpecs

    return (
        <div className='px-6 my-20 max-w-6xl mx-auto'>
            <Title visibleButton={false} title={t('ourSpecifications')} description="" />

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 gap-y-10 mt-26'>
                {
                    specs.map((spec, index) => {
                        const Icon = iconMap[spec.icon] || ShieldCheckIcon
                        return (
                            <div className='relative h-44 px-8 flex flex-col items-center justify-center w-full text-center border rounded-lg group' style={{ backgroundColor: (spec.accent || '#16a34a') + '1a', borderColor: (spec.accent || '#16a34a') + '30' }} key={index}>
                                <h3 className='text-slate-800 font-medium'>{spec.title}</h3>
                                <p className='text-sm text-slate-600 mt-3'>{spec.description}</p>
                                <div className='absolute -top-5 text-white size-10 flex items-center justify-center rounded-md group-hover:scale-105 transition' style={{ backgroundColor: spec.accent || '#16a34a' }}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default OurSpecs
