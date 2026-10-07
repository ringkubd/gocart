'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BestSelling = ({ initialProducts = [] }) => {

    const displayQuantity = 8
    const reduxProducts = useSelector(state => state.product.list)
    const products = initialProducts && initialProducts.length ? initialProducts : reduxProducts

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                {products.slice().sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0)).slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling
