'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProductClient({ initialProduct }) {

    const { productId } = useParams();
    const [product, setProduct] = useState(initialProduct || undefined);
    const [loading, setLoading] = useState(!initialProduct);
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        // Prefer server-provided data for the matching id
        if (initialProduct && initialProduct.id === productId) {
            setProduct(initialProduct);
            setLoading(false);
            return;
        }
        // Try Redux (already loaded)
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
        if (initialProduct && initialProduct.id === productId) {
            setProduct(initialProduct)
            setLoading(false)
        } else {
            setLoading(true)
            setProduct(undefined)
            fetchProduct()
        }
        scrollTo(0, 0)
    }, [productId, initialProduct]);

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">

                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="text-gray-600 text-sm mt-8 mb-5">
                    <a href="/" className="hover:underline">Home</a> / <a href="/shop" className="hover:underline">Products</a> / {product?.category}
                </nav>

                {/* Product Details */}
                {product ? (<>
                    <ProductDetails product={product} />
                    <ProductDescription product={product} />
                </>) : (!loading && (
                    <div className="text-slate-400 py-20 text-center">Product not found.</div>
                ))}
            </div>
        </div>
    );
}
