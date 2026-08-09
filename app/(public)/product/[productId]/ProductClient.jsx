'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "@/components/Loading";

export default function ProductClient() {

    const { productId } = useParams();
    const [product, setProduct] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        // Try Redux first (already loaded)
        const cached = products.find((product) => product.id === productId);
        if (cached) {
            setProduct(cached);
            setLoading(false);
            return;
        }
        // Fallback to API for deep links
        try {
            const res = await fetch(`/api/products/${productId}`)
            const data = await res.json()
            if (res.ok) {
                setProduct(data.product)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        setProduct(undefined)
        fetchProduct()
        scrollTo(0, 0)
    }, [productId, products]);

    if (loading) return <Loading />

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrums */}
                <div className="  text-gray-600 text-sm mt-8 mb-5">
                    Home / Products / {product?.category}
                </div>

                {/* Product Details */}
                {product ? (<>
                    <ProductDetails product={product} />
                    <ProductDescription product={product} />
                </>) : (
                    <div className="text-slate-400 py-20 text-center">Product not found.</div>
                )}
            </div>
        </div>
    );
}
