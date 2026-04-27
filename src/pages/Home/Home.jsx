import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroLeft}>
          <div className={styles.textContent}>
            <p className={styles.tagline}>Experience immersive sound, unmatched comfort, and bold style — all in one wave.</p>
            <h1 className={styles.heading}>Welcome to<br />HeadWave</h1>
          </div>
          <Link to="/shop" className={styles.box}>
            <div className={`${styles.layer} ${styles.whiteLayer}`} />
            <div className={`${styles.layer} ${styles.blackLayer}`} />
            <span className={styles.shopText}>Shop Now</span>
          </Link>
        </div>

        <div className={styles.heroRight} />

        <img src="/images/homeimage.png" className={styles.img} alt="Premium headphones" />
      </div>
    </section>
  )
}