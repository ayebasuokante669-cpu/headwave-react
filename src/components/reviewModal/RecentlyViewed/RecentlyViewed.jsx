import { useCart } from '../../../context/CartContext'
import styles from './RecentlyViewed.module.css'

export default function RecentlyViewed({ onSelect }) {
  const { recentlyViewed } = useCart()

  if (recentlyViewed.length === 0) return null

  return (
    <div className={styles.container}>
      <h4 className={styles.heading}>Recently Viewed</h4>
      <ul className={styles.list}>
        {recentlyViewed.map(product => (
          <li key={product.id} className={styles.item} onClick={() => onSelect(product)}>
            <img
              src={product.images[product.colors[0]]}
              alt={product.name}
              className={styles.thumb}
            />
            <div className={styles.info}>
              <span className={styles.name}>{product.name}</span>
              <span className={styles.price}>${product.price}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
