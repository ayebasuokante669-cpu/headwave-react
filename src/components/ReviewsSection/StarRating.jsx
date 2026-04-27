import styles from './ReviewsSection.module.css'

export default function StarRating({ stars, max = 5 }) {
  return (
    <div className={styles.stars} aria-label={`${stars} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <i
          key={i}
          className={`bi bi-star${i < stars ? '-fill' : ''} ${i < stars ? styles.starFilled : styles.starEmpty}`}
        />
      ))}
    </div>
  )
}
