import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReviewsSection from '../../components/ReviewsSection/ReviewsSection'
import styles from './About.module.css'

export default function About() {
  const statsRef   = useRef(null)
  const ctaRef     = useRef(null)
  const reviewsRef = useRef(null)
  const [statsIn, setStatsIn]     = useState(false)
  const [ctaIn, setCtaIn]         = useState(false)
  const [reviewsIn, setReviewsIn] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (e.target === statsRef.current)   setStatsIn(true)
          if (e.target === ctaRef.current)     setCtaIn(true)
          if (e.target === reviewsRef.current) setReviewsIn(true)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.1 })
    if (statsRef.current)   obs.observe(statsRef.current)
    if (ctaRef.current)     obs.observe(ctaRef.current)
    if (reviewsRef.current) obs.observe(reviewsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div className={styles.page}>
      <section className={styles.about}>
        <div className={styles.container}>
          <div
            className={styles.left}
            onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
          >
            <h1>About Us</h1>
            <p>
              We craft audio gear that blends immersive sound with cutting-edge design. HeadWave was born
              from a single belief: that great audio should be accessible to everyone — from the casual
              listener who wants to feel their playlist to the audiophile chasing sonic perfection.
            </p>
            <p>
              Every product in our lineup is handpicked for its ability to move with your rhythm, whether
              you're commuting, creating, or simply escaping. We don't just sell headphones. We sell the
              wave of sound you ride every day.
            </p>
          </div>

          <div
            className={styles.right}
            onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
          >
            <h2>Why Choose HeadWave?</h2>
            <ul className={styles.featureList}>
              {[
                ['bi-soundwave', 'Studio-quality sound in every product'],
                ['bi-ear', 'Enhanced listening experience engineered for your ears'],
                ['bi-clock', 'All-day comfort — wear it for hours, feel nothing but music'],
                ['bi-gem', 'Premium materials with bold, timeless aesthetics'],
                ['bi-headset', 'Service that listens — just like our headphones'],
                ['bi-shield-check', '2-year warranty on all products'],
              ].map(([icon, text]) => (
                <li key={icon}>
                  <i className={`bi ${icon}`} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          ref={statsRef}
          className={`${styles.stats} ${statsIn ? 'fadeInUp' : styles.preAnim}`}
          style={statsIn ? { animationDelay: '0.2s', willChange: 'transform, opacity' } : undefined}
          onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
        >
          {[['50K+', 'Happy Customers'], ['11', 'Products'], ['2-Year', 'Warranty'], ['24/7', 'Support']].map(([val, label]) => (
            <div key={label} className={styles.stat}>
              <span className={styles.statVal}>{val}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Explore CTA */}
      <div
        ref={ctaRef}
        className={`${styles.exploreCta} ${ctaIn ? 'fadeInUp' : styles.preAnim}`}
        style={ctaIn ? { animationDelay: '0.2s', willChange: 'transform, opacity' } : undefined}
        onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
      >
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaHeading}>Want to learn more about audio?</h2>
          <p className={styles.ctaSub}>Dive into our guides, comparisons, and expert picks.</p>
          <Link to="/explore" className={styles.exploreBox}>
            <div className={`${styles.exploreLayer} ${styles.exploreWhiteLayer}`} />
            <div className={`${styles.exploreLayer} ${styles.exploreBlackLayer}`} />
            <span className={styles.exploreText}>Explore Now →</span>
          </Link>
        </div>
      </div>

      {/* Reviews */}
      <div
        ref={reviewsRef}
        className={`${styles.reviewsWrap} ${reviewsIn ? 'fadeInUp' : styles.preAnim}`}
        style={reviewsIn ? { animationDelay: '0.4s', willChange: 'transform, opacity' } : undefined}
        onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
      >
        <ReviewsSection />
      </div>
    </div>
  )
}
