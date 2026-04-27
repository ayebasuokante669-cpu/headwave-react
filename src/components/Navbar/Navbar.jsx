import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { products } from '../../products'
import styles from './Navbar.module.css'

const KEYWORDS = [
  ...products.map(p => p.name),
  ...products.map(p => p.category),
  'headphones', 'wireless', 'noise cancellation', 'earbuds',
  'soundbar', 'microphone', 'speaker', 'bluetooth', 'spatial audio',
]

export default function Navbar() {
  const { itemCount, items, removeItem, total } = useCart()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const searchRef = useRef(null)
  const navRef = useRef(null)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleToggleTheme = () => {
    toggleTheme()
    setSpinning(true)
    setTimeout(() => setSpinning(false), 1200)
  }

  const rafId = useRef(null)
  const handleMouseMove = useCallback(e => {
    if (rafId.current) return
    const clientX = e.clientX
    rafId.current = requestAnimationFrame(() => {
      const nav = navRef.current
      if (nav) {
        const { left, width } = nav.getBoundingClientRect()
        const x = (clientX - left) / width
        nav.style.setProperty('--angle', `${100 + x * 80}deg`)
      }
      rafId.current = null
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    navRef.current?.style.removeProperty('--angle')
  }, [])

  const handleInput = e => {
    const val = e.target.value
    setQuery(val)
    if (!val.trim()) { setSuggestions([]); return }
    const hits = [...new Set(KEYWORDS.filter(k => k.toLowerCase().includes(val.toLowerCase())))].slice(0, 6)
    setSuggestions(hits)
  }

  const commit = term => {
    setQuery(term)
    setSuggestions([])
    navigate(`/shop?search=${encodeURIComponent(term)}`)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && query.trim()) commit(query.trim())
  }

  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestions([])
      if (cartOpen && !e.target.closest('[data-cart]')) setCartOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [cartOpen])

  return (
    <nav
      className={styles.navbar}
      ref={navRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link to="/" className={styles.logo}>
        <i className="bi bi-headphones" aria-label="HeadWave" />
      </Link>

      <ul className={styles.links}>
        {[['/', 'Home'], ['/shop', 'Shop Now'], ['/about', 'About Us'], ['/explore', 'Explore'], ['/contact', 'Contact Us']].map(([to, label]) => (
          <li key={to}>
            <Link to={to} className={pathname === to ? styles.active : ''}>{label}</Link>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <div className={styles.search} ref={searchRef}>
          <i className="bi bi-search" onClick={() => searchRef.current.querySelector('input').focus()} />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map(s => (
                <li key={s} onClick={() => commit(s)}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        <button className={styles.iconBtn} onClick={handleToggleTheme} aria-label="Toggle theme">
          <i className={`bi bi-${theme === 'light' ? 'moon-fill' : 'sun-fill'} ${spinning ? styles.spinIcon : ''}`} />
        </button>

        <div data-cart className={styles.cartWrap}>
          <button className={styles.iconBtn} onClick={() => setCartOpen(o => !o)} aria-label="Cart">
            <i className={`bi bi-cart4 ${styles.cartIcon}`} />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>

          {cartOpen && (
            <div className={styles.cartDropdown}>
              <h3>Your Cart</h3>
              {items.length === 0 ? (
                <p className={styles.empty}>Cart is empty</p>
              ) : (
                <>
                  <ul className={styles.cartList}>
                    {items.map(item => (
                      <li key={item.key} className={styles.cartItem}>
                        <img src={item.product.images[item.color]} alt={item.product.name} loading="lazy" />
                        <div className={styles.cartInfo}>
                          <span className={styles.cartName}>{item.product.name}</span>
                          <span className={styles.cartMeta}>{item.color} · qty {item.quantity}</span>
                          <span className={styles.cartPrice}>${(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <button className={styles.removeBtn} onClick={() => removeItem(item.key)}>×</button>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.cartFooter}>
                    <strong>Total: ${total.toLocaleString()}</strong>
                    <button className={styles.checkoutBtn} onClick={() => setCartOpen(false)}>Checkout</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
