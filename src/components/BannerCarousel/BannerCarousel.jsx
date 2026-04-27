import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './BannerCarousel.module.css'

const PROMO_KEY = 'headwave_promo_end'
const PROMO_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const INTERVAL_MS = 5000

function getPromoEnd() {
  try {
    const stored = localStorage.getItem(PROMO_KEY)
    if (stored) {
      const ts = parseInt(stored, 10)
      if (!isNaN(ts) && ts > Date.now()) return ts
    }
  } catch (_) { /* storage unavailable */ }
  const end = Date.now() + PROMO_DURATION_MS
  try { localStorage.setItem(PROMO_KEY, String(end)) } catch (_) {}
  return end
}

function formatCountdown(ms) {
  if (ms <= 0) return '00d 00h 00m 00s'
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(d).padStart(2, '0')}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`
}

const SLIDES = [
  { id: 'promo' },
  { id: 'arrivals' },
  { id: 'shipping' },
  { id: 'toprated' },
]

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [countdown, setCountdown] = useState('')
  const promoEnd = useRef(getPromoEnd())
  const timerRef = useRef(null)

  // Countdown tick
  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(promoEnd.current - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-advance — restart interval on manual nav
  const startAutoPlay = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length)
    }, INTERVAL_MS)
  }, [])

  useEffect(() => {
    startAutoPlay()
    return () => clearInterval(timerRef.current)
  }, [startAutoPlay])

  const goTo = useCallback(idx => {
    setCurrent(idx)
    startAutoPlay()
  }, [startAutoPlay])

  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo])
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo])

  return (
    <div className={styles.carousel} role="region" aria-label="Promotions">
      <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>

        {/* Slide 1 — Promo + countdown */}
        <div className={`${styles.slide} ${styles.s1}`}>
          <div className={styles.content}>
            <span className={styles.eyebrow}>LIMITED TIME OFFER</span>
            <h2>Get 30% off the  Sony WH-1000XM6</h2>
            <div className={styles.timer}>
              <span className={styles.timerLabel}>Ends in</span>
              <span className={styles.timerValue}>{countdown}</span>
            </div>
          </div>
        </div>

        {/* Slide 2 — New Arrivals */}
        <div className={`${styles.slide} ${styles.s2}`}>
          <div className={styles.content}>
            <span className={styles.slideIcon} aria-hidden="true">🎵</span>
            <h2>New Arrivals</h2>
            <p className={styles.sub}>JBL, Sony, Bose. Fresh drops every week.</p>
          </div>
        </div>

        {/* Slide 3 — Free Shipping */}
        <div className={`${styles.slide} ${styles.s3}`}>
          <div className={styles.content}>
            <span className={styles.slideIcon} aria-hidden="true">📦</span>
            <h2>Free Shipping</h2>
            <p className={styles.sub}>On all orders over $100</p>
          </div>
        </div>

        {/* Slide 4 — Top Rated */}
        <div className={`${styles.slide} ${styles.s4}`}>
          <div className={styles.content}>
            <span className={styles.slideIcon} aria-hidden="true">🏆</span>
            <h2>Top Rated This Month</h2>
            <p className={styles.sub}>Nothing Ear (a)</p>
            <p className={styles.stars} aria-label="5 stars">⭐⭐⭐⭐⭐</p>
          </div>
        </div>

      </div>

      {/* Arrows */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous slide">
        <i className="bi bi-chevron-left" />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next slide">
        <i className="bi bi-chevron-right" />
      </button>

      {/* Dots */}
      <div className={styles.dots} role="tablist">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
