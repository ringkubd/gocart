import { createSlice } from '@reduxjs/toolkit'

const loadCart = () => {
    if (typeof window === 'undefined') return { total: 0, cartItems: {} }
    try {
        const saved = localStorage.getItem('cart')
        if (saved) {
            const parsed = JSON.parse(saved)
            const items = parsed.cartItems || {}
            // Migrate old format: { productId: quantity } → { key: { productId, variantId, quantity } }
            const migrated = {}
            let total = 0
            for (const [key, value] of Object.entries(items)) {
                if (typeof value === 'number') {
                    // Old format: key is productId, value is quantity
                    migrated[key] = { productId: key, variantId: null, quantity: value }
                } else {
                    // New format: value is { productId, variantId, quantity }
                    migrated[key] = value
                }
                total += typeof value === 'number' ? value : value.quantity
            }
            return { total, cartItems: migrated }
        }
    } catch (e) {}
    return { total: 0, cartItems: {} }
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: loadCart(),
    reducers: {
        addToCart: (state, action) => {
            const { productId, variantId } = action.payload
            const key = variantId ? `${productId}:${variantId}` : productId
            if (state.cartItems[key]) {
                state.cartItems[key].quantity++
            } else {
                state.cartItems[key] = { productId, variantId: variantId || null, quantity: 1 }
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId, variantId } = action.payload
            const key = variantId ? `${productId}:${variantId}` : productId
            if (state.cartItems[key]) {
                state.cartItems[key].quantity--
                if (state.cartItems[key].quantity === 0) {
                    delete state.cartItems[key]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId, variantId } = action.payload
            const key = variantId ? `${productId}:${variantId}` : productId
            state.total -= state.cartItems[key] ? state.cartItems[key].quantity : 0
            delete state.cartItems[key]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
