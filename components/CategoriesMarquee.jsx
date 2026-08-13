'use client'
import Link from "next/link";
import useStorefrontData from "./useStorefrontData";
import { useLocalized } from "./useLocalized";

const CategoriesMarquee = () => {

    const { categories } = useStorefrontData();
    const { text } = useLocalized();

    const cats = categories.length > 0 ? categories : ["Headphones", "Speakers", "Watch", "Earbuds", "Mouse", "Decoration"];

    return (
        <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
            <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
            <div className="flex min-w-[200%] animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-4" >
                {[...cats, ...cats, ...cats, ...cats].map((cat, index) => (
                    <Link href={`/shop?category=${typeof cat === 'string' ? cat : cat.slug}`} key={index} className="px-5 py-2 bg-slate-100 rounded-lg text-slate-500 text-xs sm:text-sm hover:bg-slate-600 hover:text-white active:scale-95 transition-all duration-300">
                        {typeof cat === 'string' ? cat : text(cat.name, cat.nameBn)}
                    </Link>
                ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>
    );
};

export default CategoriesMarquee;
