"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image_url?: string
    stock: number
}

interface CartContextType {
    cart: CartItem[]
    addToCart: (product: any) => void
    updateQuantity: (id: string, delta: number) => void
    clearCart: () => void
    cartTotal: number
}

const CartContext = createContext<CartContextType>({
    cart: [],
    addToCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    cartTotal: 0
})

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])
    const { toast } = useToast()
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("pos_cart")
        if (stored) {
            try {
                setCart(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Update LocalStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("pos_cart", JSON.stringify(cart))
        }
    }, [cart, isLoaded])

    const addToCart = (product: any) => {
        if (product.stock <= 0) {
            toast({ title: "Out of Stock", description: "Cannot sell items with 0 stock.", variant: "destructive" })
            return
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast({ title: "Stock Limit Reached", description: `Only ${product.stock} available.`, variant: "destructive" })
                    return prev
                }
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image_url: product.image_url,
                stock: product.stock
            }]
        })
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === id)
            if (!existing) return prev

            const newQty = existing.quantity + delta

            // Check stock limit if increasing
            if (delta > 0 && newQty > existing.stock) {
                toast({ title: "Stock Limit Reached", description: `Only ${existing.stock} available.`, variant: "destructive" })
                return prev
            }

            if (newQty <= 0) return prev.filter(item => item.id !== id)

            return prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)
        })
    }

    const clearCart = () => setCart([])

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
