import { createContext, useContext, useState } from 'react'
import CartToast from '../components/Toast/CartToast'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addItem = (product, color) => {
    setItems(prev => {
      const key = `${product.id}-${color}`
      const existing = prev.find(i => i.key === key)
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { key, product, color, quantity: 1 }]
    })
    showToast(`${product.name} added to cart`, 'success')
  }

  const removeItem = key => {
    setItems(prev => prev.filter(i => i.key !== key))
    showToast('Item removed from cart', 'error')
  }

  const updateQuantity = (key, qty) => {
    if (qty <= 0) { removeItem(key); return }
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantity: qty } : i))
  }

  const addRecentlyViewed = product => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id)
      return [product, ...filtered].slice(0, 6)
    })
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, total, itemCount, recentlyViewed, addRecentlyViewed }}>
      {children}
      {toast && <CartToast message={toast.message} type={toast.type} />}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
