import { useState, useEffect, useRef } from 'react'
import StarRating from './StarRating'
import styles from './ReviewsSection.module.css'

const FIXED_REVIEWS = [
  { stars: 5, text: "HeadWave made finding my perfect headphones actually fun. The quiz nailed it on the first try." },
  { stars: 5, text: "Fastest delivery I've experienced from an audio store. Packaging was premium too." },
  { stars: 4, text: "Great selection and the product details are super thorough. Wish there were more budget options." },
  { stars: 5, text: "The site is beautiful and easy to use. Bought the JBL Charge 6 and couldn't be happier." },
  { stars: 5, text: "Customer support responded in under an hour. Rare to see that kind of service these days." },
  { stars: 4, text: "Really solid experience overall. The Explore articles are genuinely useful, not just fluff." },
  { stars: 5, text: "Ordered as a gift, arrived perfectly packaged. The recipient was blown away." },
  { stars: 5, text: "HeadWave feels like a brand that actually knows audio. Trust the recommendations here." },
]

const natToFlag = code =>
  code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('')

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // IntersectionObserver for card stagger animation
  const gridRef = useRef(null)
  const [gridIn, setGridIn] = useState(false)

  useEffect(() => {
    fetch('https://randomuser.me/api/?results=8&inc=name,picture,nat')
      .then(r => r.json())
      .then(data => {
        setReviews(
          data.results.map((user, i) => ({
            name: `${user.name.first} ${user.name.last}`,
            avatar: user.picture.medium,
            flag: natToFlag(user.nat),
            stars: FIXED_REVIEWS[i].stars,
            text: FIXED_REVIEWS[i].text,
          }))
        )
      })
      .catch(() => {
        setReviews(
          FIXED_REVIEWS.map(r => ({
            name: 'Verified Buyer',
            avatar: null,
            flag: '🌍',
            stars: r.stars,
            text: r.text,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setGridIn(true)
        obs.unobserve(el)
      }
    }, { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>What Our Customers Say</h2>
      <div ref={gridRef} className={styles.grid}>
        {loading
          ? Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
                <div className={styles.cardTop}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonMeta}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonName}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonFlag}`} />
                  </div>
                </div>
                <div className={`${styles.skeletonLine} ${styles.skeletonStars}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonText1}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonText2}`} />
              </div>
            ))
          : reviews.map((r, i) => (
              <div
                key={i}
                className={`${styles.card} ${gridIn ? 'fadeInUp' : styles.preAnim}`}
                style={gridIn ? { animationDelay: `${Math.min(i * 0.1, 0.7)}s`, willChange: 'transform, opacity' } : undefined}
                onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
              >
                <div className={styles.cardTop}>
                  {r.avatar
                    ? <img src={r.avatar} alt={r.name} className={styles.avatar} loading="lazy" />
                    : (
                      <div className={styles.avatarFallback}>
                        {r.name.charAt(0)}
                      </div>
                    )
                  }
                  <div className={styles.identity}>
                    <span className={styles.name}>{r.name}</span>
                    <span className={styles.flag} title="nationality">{r.flag}</span>
                  </div>
                </div>
                <StarRating stars={r.stars} />
                <p className={styles.text}>&ldquo;{r.text}&rdquo;</p>
              </div>
            ))
        }
      </div>
    </section>
  )
}
