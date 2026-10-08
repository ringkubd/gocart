'use client'
import { Suspense } from "react"
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AttributionCapture from "@/components/AttributionCapture";

export default function PublicLayout({ children }) {

    return (
        <>
            <Suspense fallback={null}>
                <AttributionCapture />
            </Suspense>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
