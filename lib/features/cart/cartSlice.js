import { createSlice } from '@reduxjs/toolkit'

const loadCart = () => {
    if (typeof window === 'undefined') return { total: 0, cartItems: {} }
    try {
        const saved = localStorage.getItem('cart')
        if (saved) {
            const parsed = JSON.parse(saved)
            return { total: Object.values(parsed.cartItems || {}).reduce((s, v) => s + v, 0), cartItems: parsed.cartItems || {} }
        }
    } catch (e) {}
    return { total: 0, cartItems: {} }
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: loadCart(),
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
