'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LatestProducts = ({ initialProducts = [] }) => {

    const displayQuantity = 4
    const reduxProducts = useSelector(state => state.product.list)
    const products = initialProducts && initialProducts.length ? initialProducts : reduxProducts

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'>
                {products.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts
