import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../../context/CartContext'
import RecentlyViewed from './RecentlyViewed/RecentlyViewed'
import styles from './ReviewModal.module.css'

export default function ReviewModal({ product, onClose, onSelectProduct }) {
  const { addItem, addRecentlyViewed } = useCart()
  const [color, setColor] = useState(product.colors[0])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    addRecentlyViewed(product)
    setColor(product.colors[0])
    setQty(1)
    setAdded(false)
  }, [product.id])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product, color)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return createPortal(
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg" />
        </button>

        <div className={styles.body}>
          {/* Left – image */}
          <div className={styles.imageSection}>
            <div className={styles.imageWrap}>
              <img
                key={color}
                src={product.images[color]}
                alt={`${product.name} – ${color}`}
                className={styles.productImage}
              />
            </div>
            <div className={styles.colorPicker}>
              {product.colors.map(c => (
                <button
                  key={c}
                  className={`${styles.swatch} ${c === color ? styles.swatchActive : ''}`}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  title={c}
                  style={{ '--swatch-color': SWATCH_MAP[c] || c }}
                />
              ))}
            </div>
            <p className={styles.colorLabel}>{color.charAt(0).toUpperCase() + color.slice(1)}</p>
          </div>

          {/* Right – info */}
          <div className={styles.infoSection}>
            <span className={styles.category}>{product.category}</span>
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.price}>${product.price.toLocaleString()}</p>

            <p className={styles.description}>{product.description}</p>

            <div className={styles.specs}>
              <h4>Key Specs</h4>
              <ul>
                {product.specs.map((s, i) => (
                  <li key={i}><i className="bi bi-check-circle-fill" /> {s}</li>
                ))}
              </ul>
            </div>

            <div className={styles.cartRow}>
              <div className={styles.qtyControl}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button className={`${styles.addBtn} ${added ? styles.added : ''}`} onClick={handleAdd}>
                {added ? <><i className="bi bi-check-lg" /> Added!</> : 'Add to Cart'}
              </button>
            </div>

            <RecentlyViewed onSelect={p => onSelectProduct(p)} />
          </div>
        </div>
      </div>
    </div>,
    document.body
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
