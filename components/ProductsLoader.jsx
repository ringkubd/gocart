'use client'
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setProduct } from "@/lib/features/product/productSlice"

export default function ProductsLoader() {
    const dispatch = useDispatch()
    const products = useSelector(state => state.product.list)

    useEffect(() => {
        if (products.length > 0) return

        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/products")
                const data = await res.json()
                if (data.products?.length) {
                    dispatch(setProduct(data.products))
                }
            } catch (error) {
                console.error("Failed to load products:", error)
            }
        }
        fetchProducts()
    }, [dispatch, products.length])

    return null
}
