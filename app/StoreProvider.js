'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  useEffect(() => {
    const unsubscribe = storeRef.current.subscribe(() => {
      const state = storeRef.current.getState()
      try {
        localStorage.setItem('cart', JSON.stringify({ cartItems: state.cart.cartItems }))
      } catch (e) {}
    })
    return () => unsubscribe()
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
