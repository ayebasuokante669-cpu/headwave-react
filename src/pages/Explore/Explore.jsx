import { useState, useRef, useEffect } from 'react'
import HeadphoneQuiz from '../../components/HeadphoneQuiz/HeadphoneQuiz'
import ArticleReader from '../../components/ArticleReader/ArticleReader'
import styles from './Explore.module.css'

const HARDCODED_ARTICLES = [
  {
    id: 'anc-explained',
    tag: 'Technology',
    title: 'How Active Noise Cancellation Actually Works',
    desc: 'Inside the microphones, algorithms, and anti-phase waves that make the world go quiet.',
    topic: 'How active noise cancellation works in headphones — the science behind microphones, anti-phase sound waves, and feedforward vs feedback ANC designs',
    readTime: '4 min read',
  },
  {
    id: 'wireless-codecs',
    tag: 'Audio',
    title: 'AAC vs aptX vs LDAC: Which Bluetooth Codec Should You Care About?',
    desc: 'A plain-English breakdown of Bluetooth audio codecs and when the difference actually matters.',
    topic: 'Bluetooth audio codecs comparison: AAC vs aptX vs LDAC — bitrates, latency, device compatibility, and whether audiophiles should care',
    readTime: '5 min read',
  },
  {
    id: 'soundstage',
    tag: 'Audio',
    title: 'What Is Soundstage and Why Does It Matter?',
    desc: 'Open-back vs closed-back, driver placement, and the illusion of space in your headphones.',
    topic: 'Soundstage in headphones — what it means, how open-back vs closed-back designs affect it, and how driver placement creates a sense of space',
    readTime: '4 min read',
  },
  {
    id: 'battery-tips',
    tag: 'Tips',
    title: '8 Habits That Drain Your Headphone Battery Faster',
    desc: 'Small changes that can meaningfully extend the life of your wireless headphones.',
    topic: 'How to extend wireless headphone battery life — common habits that drain batteries faster and practical tips to get more hours per charge',
    readTime: '3 min read',
  },
  {
    id: 'eq-guide',
    tag: 'Tips',
    title: 'EQ for Beginners: Shaping Your Sound Without Breaking It',
    desc: 'What the frequency bands mean and how to tune your headphones without making them worse.',
    topic: 'Beginner guide to headphone EQ — what frequency bands mean, how to boost/cut safely, common EQ mistakes, and recommended starting points',
    readTime: '5 min read',
  },
  {
    id: 'gaming-headsets',
    tag: 'Buying Guide',
    title: 'Gaming Headsets vs Hi-Fi Headphones for Gaming: The Real Difference',
    desc: 'Positional audio, mic quality, and whether you actually need a dedicated gaming headset.',
    topic: 'Gaming headsets vs hi-fi headphones for gaming — positional audio, virtual surround sound, mic quality differences, and which is worth buying',
    readTime: '4 min read',
  },
]

const TAGS = ['All', ...new Set(HARDCODED_ARTICLES.map(a => a.tag))]

async function fetchGeneratedCards(topic) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('No API key found. Add VITE_GROQ_API_KEY to your .env file.')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an editorial assistant for HeadWave, a premium audio brand. Generate article card metadata. Respond in JSON only — no markdown, no backticks, no explanation. Just the raw JSON array.',
        },
        {
          role: 'user',
          content: `Generate 3 article card objects for the topic "${topic}". Each object: { "id": "generated-${topic}-{1|2|3}", "title": string, "teaser": string (max 12 words), "readTime": string (e.g. "4 min read"), "tag": "${topic}" }. Return a JSON array only.`,
        },
      ],
      max_tokens: 400,
    }),
  })

  const data = await res.json()
  const raw = data.choices[0].message.content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/g, '')
    .trim()
  const cards = JSON.parse(raw)
  // Normalise: add topic + desc alias so ArticleReader and card rendering both work
  return cards.map(c => ({ ...c, desc: c.teaser, topic }))
}

export default function Explore() {
  const [openArticle, setOpenArticle]     = useState(null)
  const [articleCache, setArticleCache]   = useState({})

  // Topic filter state
  const [activeTag, setActiveTag]         = useState('All')
  const [generatedCards, setGeneratedCards] = useState({})
  const [loadingTopic, setLoadingTopic]   = useState(null)
  const [topicError, setTopicError]       = useState(null)

  const isLoading      = loadingTopic === activeTag
  const visibleArticles = activeTag === 'All'
    ? HARDCODED_ARTICLES
    : (generatedCards[activeTag] || [])

  const handleCache = (id, text) => setArticleCache(prev => ({ ...prev, [id]: text }))

  const doFetch = async (tag) => {
    setLoadingTopic(tag)
    setTopicError(null)
    try {
      const cards = await fetchGeneratedCards(tag)
      setGeneratedCards(prev => ({ ...prev, [tag]: cards }))
    } catch {
      setTopicError(tag)
    } finally {
      setLoadingTopic(null)
    }
  }

  const handleTagClick = (tag) => {
    if (tag === activeTag) return
    setActiveTag(tag)
    setTopicError(null)
    if (tag === 'All' || generatedCards[tag]) return
    doFetch(tag)
  }

  const handleRetry = () => {
    const tag = activeTag
    setGeneratedCards(prev => { const n = { ...prev }; delete n[tag]; return n })
    doFetch(tag)
  }

  // ── Entrance animations ───────────────────────────────────────────
  const quizRef    = useRef(null)
  const headingRef = useRef(null)
  const gridRef    = useRef(null)
  const [quizIn, setQuizIn]         = useState(false)
  const [headingIn, setHeadingIn]   = useState(false)
  const [gridVisible, setGridVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (e.target === quizRef.current)    setQuizIn(true)
          if (e.target === headingRef.current) setHeadingIn(true)
          if (e.target === gridRef.current)    setGridVisible(true)
          obs.unobserve(e.target)
        }
      })
    }, { threshold: 0.05 })
    if (quizRef.current)    obs.observe(quizRef.current)
    if (headingRef.current) obs.observe(headingRef.current)
    if (gridRef.current)    obs.observe(gridRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Quiz */}
        <div
          ref={quizRef}
          className={quizIn ? 'fadeInUp' : styles.preAnim}
          style={quizIn ? { animationDelay: '0.2s', willChange: 'transform, opacity' } : undefined}
          onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
        >
          <HeadphoneQuiz />
        </div>

        <section>
          {/* Section heading */}
          <div
            ref={headingRef}
            className={`${styles.sectionHeader} ${headingIn ? 'fadeInUp' : styles.preAnim}`}
            style={headingIn ? { animationDelay: '0.1s', willChange: 'transform, opacity' } : undefined}
            onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
          >
            <i className="bi bi-journal-richtext" />
            <h2>Audio Insights</h2>
          </div>

          {/* Topic filter bar */}
          <div className={styles.tagFilters}>
            {TAGS.map(tag => (
              <button
                key={tag}
                className={`${styles.tagBtn} ${activeTag === tag ? styles.tagActive : ''}`}
                onClick={() => handleTagClick(tag)}
                disabled={isLoading}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Error state */}
          {topicError === activeTag && !isLoading && (
            <div className={styles.errorWrap}>
              <p className={styles.filterError}>
                <i className="bi bi-exclamation-triangle-fill" /> Couldn&apos;t load articles. Try again.
              </p>
              <button className={styles.retryBtn} onClick={handleRetry}>Retry</button>
            </div>
          )}

          {/* Loading skeleton — 3 cards */}
          {isLoading && (
            <div className={styles.grid}>
              {[0, 1, 2].map(i => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skLine} style={{ width: '40%', height: '20px' }} />
                  <div className={styles.skLine} style={{ width: '90%', height: '28px', marginTop: '12px' }} />
                  <div className={styles.skLine} style={{ width: '70%', height: '16px', marginTop: '8px' }} />
                  <div className={styles.skLine} style={{ width: '30%', height: '14px', marginTop: '16px' }} />
                </div>
              ))}
            </div>
          )}

          {/* Article cards */}
          {!isLoading && topicError !== activeTag && (
            <div ref={gridRef} className={styles.grid}>
              {visibleArticles.map((article, idx) => (
                <article
                  key={article.id + '-' + activeTag}
                  className={`${styles.card} ${gridVisible ? 'fadeInUp' : styles.preAnim}`}
                  style={gridVisible
                    ? { animationDelay: `${Math.min(idx * 0.1, 0.5)}s`, willChange: 'transform, opacity' }
                    : undefined
                  }
                  onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
                  onClick={() => setOpenArticle(article)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setOpenArticle(article)}
                >
                  <span className={styles.cardTag}>{article.tag}</span>
                  <h3 className={styles.cardTitle}>{article.title}</h3>
                  <p className={styles.cardDesc}>{article.desc || article.teaser}</p>
                  {article.readTime && (
                    <div className={styles.cardMeta}>
                      <i className="bi bi-clock" /> {article.readTime}
                    </div>
                  )}
                  <span className={styles.cardCta}>Read article <i className="bi bi-arrow-right" /></span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {openArticle && (
        <ArticleReader
          article={openArticle}
          cache={articleCache}
          onCache={handleCache}
          onClose={() => setOpenArticle(null)}
        />
      )}
    </div>
  )
}
