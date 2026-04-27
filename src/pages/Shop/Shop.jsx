import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { products } from '../../products'
import { useCart } from '../../context/CartContext'
import ReviewModal from '../../components/reviewModal/ReviewModal'
import BannerCarousel from '../../components/BannerCarousel/BannerCarousel'
import styles from './Shop.module.css'

const CATEGORIES = ['All', 'Headphones', 'Speakers', 'Earbuds', 'Soundbars', 'Mics']

export default function Shop() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { addItem } = useCart()

  const [cardColors, setCardColors] = useState(
    Object.fromEntries(products.map(p => [p.id, p.colors[0]]))
  )

  const filtered = useMemo(() => {
    let list = products
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, searchQuery])

  const setColor = (id, color) => setCardColors(prev => ({ ...prev, [id]: color }))

  // IntersectionObserver for entrance animations
  const filtersRef = useRef(null)
  const gridRef    = useRef(null)
  const [filtersIn, setFiltersIn] = useState(false)
  const [gridIn, setGridIn]       = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (e.target === filtersRef.current) setFiltersIn(true)
          if (e.target === gridRef.current)    setGridIn(true)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.05 })
    if (filtersRef.current) obs.observe(filtersRef.current)
    if (gridRef.current)    obs.observe(gridRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div className={styles.page}>
      <BannerCarousel />

      {/* Category filter */}
      <div
        ref={filtersRef}
        className={`${styles.filters} ${filtersIn ? 'fadeInUp' : styles.preAnim}`}
        style={filtersIn ? { animationDelay: '0.1s', willChange: 'transform, opacity' } : undefined}
        onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
        {searchQuery && (
          <span className={styles.searchTag}>
            Search: &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <p className={styles.noResults}>No products found. Try a different search or category.</p>
      ) : (
        <div ref={gridRef} className={styles.grid}>
          {filtered.map((product, idx) => {
            const color = cardColors[product.id]
            const delay = `${Math.min(idx * 0.1, 0.6)}s`
            return (
              <div
                key={product.id}
                className={`${styles.cardWrap} ${gridIn ? 'fadeInUp' : styles.preAnim}`}
                style={gridIn ? { animationDelay: delay, willChange: 'transform, opacity' } : undefined}
                onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
              >
                <div className={styles.flipper}>
                  {/* Front */}
                  <div className={styles.front}>
                    <img src={product.images[color]} alt={product.name} className={styles.cardImg} loading="lazy" />
                    <h3 className={styles.cardName}>{product.name}</h3>
                    <p className={styles.cardCategory}>{product.category}</p>
                  </div>

                  {/* Back */}
                  <div className={styles.back}>
                    <img src={product.images[color]} alt={product.name} className={styles.cardImg} loading="lazy" />
                    <p className={styles.cardPrice}>${product.price}</p>

                    <div className={styles.swatches}>
                      {product.colors.map(c => (
                        <button
                          key={c}
                          className={`${styles.dot} ${c === color ? styles.dotActive : ''}`}
                          style={{ '--c': SWATCH_MAP[c] || c }}
                          onClick={e => { e.stopPropagation(); setColor(product.id, c) }}
                          title={c}
                          aria-label={c}
                        />
                      ))}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.addCartBtn}
                        onClick={e => { e.stopPropagation(); addItem(product, color) }}
                      >
                        <i className="bi bi-cart-plus" /> Add
                      </button>
                      <button
                        className={styles.viewBtn}
                        onClick={e => { e.stopPropagation(); setSelectedProduct(product) }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectProduct={p => setSelectedProduct(p)}
        />
      )}
    </div>
  )
}

const SWATCH_MAP = {
  white:          '#f5f5f5',
  black:          '#1a1a1a',
  blue:           '#3b82f6',
  green:          '#22c55e',
  pink:           '#ec4899',
  red:            '#ef4444',
  yellow:         '#eab308',
  quartz:         '#f0a3b8',
  blueDusk:       '#4a6480',
  citrusYellow:   '#f5c518',
  fogGrey:        '#9ba5b0',
  petalPink:      '#f4a7b9',
  sunsetPeach:    '#ffb347',
  twilightBlue:   '#1e3a5f',
  sandstone:      '#c2a87a',
  midnightBlue:   '#191970',
  platinumSilver: '#d4d4d4',
  sandPink:       '#c9958e',
}
