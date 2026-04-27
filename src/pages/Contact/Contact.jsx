import { useState } from 'react'
import styles from './Contact.module.css'

const SOCIALS = [
  { icon: 'fab fa-youtube',    href: 'https://youtube.com',   label: 'YouTube' },
  { icon: 'fab fa-instagram',  href: 'https://instagram.com', label: 'Instagram' },
  { icon: 'fab fa-x-twitter',  href: 'https://x.com',        label: 'X / Twitter' },
  { icon: 'fab fa-whatsapp',   href: 'https://whatsapp.com', label: 'WhatsApp' },
  { icon: 'fab fa-linkedin',   href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: 'fab fa-facebook',   href: 'https://facebook.com', label: 'Facebook' },
  {icon : 'fab fa-discord',     href: 'https://discord.com',  label: 'Discord' },
  {icon : 'fab fa-reddit',      href: 'https://reddit.com',   label: 'Reddit' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your full name.'
    if (!form.email.trim()) {
      e.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address.'
    }
    if (!form.message.trim()) e.message = 'Please enter a message.'
    return e
  }

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitted(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className={styles.page}>
      <section className={styles.contact}>
        <div className={styles.container}>
          {/* Left */}
          <div className={styles.left}>
            <div
              className={styles.headline}
              onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
            >
              <h1>Contact Us</h1>
              <p>Got questions or feedback?<br />We are always ready to listen — just like our headphones.</p>
            </div>
            <div
              className={styles.socials}
              onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
            >
              <p className={styles.socialsLabel}>Find us on</p>
              <p className={styles.socialsLabel}>YIXWLFDR</p>
              <div className={styles.socialGrid}>
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className={styles.socialBox} aria-label={s.label}>
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right – form */}
          <form
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
          >
            <div className={styles.field}>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? styles.inputError : ''}
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Write your message here..."
                value={form.message}
                onChange={handleChange}
                className={errors.message ? styles.inputError : ''}
              />
              {errors.message && <span className={styles.error}>{errors.message}</span>}
            </div>

            <button type="submit" className={styles.submitBtn}>
              <div className={styles.layerWhite} />
              <div className={styles.layerBlack} />
              <span className={styles.submitText}>Submit</span>
            </button>

            {submitted && (
              <p className={styles.success}>
                <i className="bi bi-check-circle-fill" /> Message sent! We&apos;ll get back to you soon.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}
