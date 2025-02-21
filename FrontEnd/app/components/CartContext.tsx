import { createContext, ReactNode, useContext, useState } from "react";

type CartProviderProps = {
    children: ReactNode
}

type CartItem = {
    _id: string
    quantity: number
}

type CartContext = {
    getItemQuantity: (_id: string) => number
    increaseCartQuantity: (_id: string) => void
    decreaseCartQuantity: (_id: string) => void
    removeFromCart: (_id: string) => void
    cartItems: CartItem[]
}
const CartContext = createContext({} as CartContext)

export function useCart() {
    return useContext(CartContext)
}

export function CartProvider({ children }: CartProviderProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    
    function getItemQuantity(_id: string) {
        return cartItems.find(item => item._id === _id)?.quantity || 0
    }

    function increaseCartQuantity(_id: string) {
        setCartItems(currItems => {
            if (currItems.find(item => item._id === _id) == null) {
                return [...currItems, {_id, quantity: 1}]
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

    function decreaseCartQuantity(_id: string) {
        setCartItems(currItems => {
            if (currItems.find(item => item._id === _id)?.quantity === 1) {
                return currItems.filter(item => item._id !== _id)
            } else {
                return currItems.map(item => {
                    if (item._id === _id){
                        return { ...item, quantity: item.quantity - 1}
                    }
                    else {
                        return item
                    }
                })
            }
        })
    }

    function removeFromCart(_id: string) {
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