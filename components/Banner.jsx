'use client'
import React from 'react'
import toast from 'react-hot-toast';
import useStorefrontData from './useStorefrontData';

export default function Banner() {

    const [isOpen, setIsOpen] = React.useState(true);
    const { settings } = useStorefrontData();

    const promo = settings.promoStrip;
    const announcement = settings.announcement;

    React.useEffect(() => {
        if ((promo && !promo.active) && !(announcement?.active)) {
            setIsOpen(false)
        }
    }, [promo, announcement])

    const handleClaim = () => {
        setIsOpen(false);
        toast.success('Coupon copied to clipboard!');
        navigator.clipboard.writeText(promo?.couponCode || '');
    };

    // Show announcement bar if active
    if (announcement?.active && announcement?.text) {
        return (
            <div className="w-full px-6 py-2 font-medium text-sm text-white text-center bg-slate-800">
                <div className='flex items-center justify-between max-w-7xl mx-auto'>
                    <p className="flex-1">{announcement.text}</p>
                    <button onClick={() => setIsOpen(false)} type="button" className="font-normal text-gray-300 hover:text-white pl-6">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="currentColor" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    if (!promo?.active) return null;

    return isOpen && (
        <div className="w-full px-6 py-1 font-medium text-sm text-white text-center bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A]">
            <div className='flex items-center justify-between max-w-7xl  mx-auto'>
                <p>{promo.text || 'Get 20% OFF on Your First Order!'}</p>
                <div className="flex items-center space-x-6">
                    <button onClick={handleClaim} type="button" className="font-normal text-gray-800 bg-white px-7 py-2 rounded-full max-sm:hidden">Claim Offer</button>
                    <button onClick={() => setIsOpen(false)} type="button" className="font-normal text-gray-800 py-2 rounded-full">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect y="12.532" width="17.498" height="2.1" rx="1.05" transform="rotate(-45.74 0 12.532)" fill="#fff" />
                            <rect x="12.533" y="13.915" width="17.498" height="2.1" rx="1.05" transform="rotate(-135.74 12.533 13.915)" fill="#fff" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
