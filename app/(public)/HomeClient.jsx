'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

export default function HomeClient({ initialProducts = [] }) {
    return (
        <div>
            <Hero />
            <LatestProducts initialProducts={initialProducts} />
            <BestSelling initialProducts={initialProducts} />
            <OurSpecs />
            <Newsletter />
        </div>
    );
}
