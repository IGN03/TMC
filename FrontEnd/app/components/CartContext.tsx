import { createContext, ReactNode, useContext, useState } from "react";

type CartProviderProps = {
    children: ReactNode
}

type CartItem = {
    _id: string
    quantity: number
    name: string
}

type CartContext = {
    getItemQuantity: (id: string) => number
    increaseCartQuantity: (id: string) => void
    decreaseCartQuantity: (id: string) => void
    removeFromCart: (id: string) => void
    cartItems: CartItem[]
}
const CartContext = createContext({} as CartContext)

export function useCart() {
    return useContext(CartContext)
}

export function CartProvider({ children }: CartProviderProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    
    function getItemQuantity(id: string) {
        return cartItems.find(item => item.id === id)?.quantity || 0
    }

    function increaseCartQuantity(id: string, name: string) {
        setCartItems(currItems => {
            if (currItems.find(item => item.id === id) == null) {
                return [...currItems, {id, name, quantity: 1}]
            } else {
                return currItems.map(item => {
                    if (item._id === _id){
                        return { ...item, quantity: item.quantity + 1}
                    }
                    else {
                        return item
                    }
                })
            }
        })
    }

    function decreaseCartQuantity(id: string) {
        setCartItems(currItems => {
            if (currItems.find(item => item._id === _id)?.quantity === 1) {
                return currItems.filter(item => item._id !== _id)
            } else {
                return currItems.map(item => {
                    if (item.id === id){
                        return { ...item, quantity: item.quantity - 1}
                    }
                    else {
                        return item
                    }
                })
            }
        })
    }

    function removeFromCart(id: string) {
        setCartItems(currItems => {
            return currItems.filter(items => items._id !== _id)
        })
    }
    return (
    <CartContext.Provider value= {{getItemQuantity, increaseCartQuantity, decreaseCartQuantity, removeFromCart, cartItems}}>
        {children}
    </CartContext.Provider>
    )
}