import { useEffect, useRef, useState } from 'react'
import styles from './ArticleReader.module.css'

const SYSTEM_PROMPT = `You are a professional audio technology journalist writing for HeadWave, a premium audio e-commerce brand. Write engaging, informative, well-structured articles about audio products and technology. Use clear headings, short paragraphs, and occasional bullet points. Tone: knowledgeable but accessible, not overly technical. Length: 600-900 words. Do not use markdown formatting like **bold** or *italic*. Use plain text only. For section headers write them in plain text followed by a colon.`

async function fetchArticle(title, topic) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('No API key found. Add VITE_GROQ_API_KEY to your .env file.')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Write a full article titled "${title}" for the topic "${topic}". Include practical advice, product mentions where relevant, and end with a clear recommendation or takeaway.` },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

function parseInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  )
}

function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h3 key={i} className={styles.subheading}>{parseInline(line.slice(3))}</h3>
    if (line.startsWith('# '))  return <h2 key={i} className={styles.heading}>{parseInline(line.slice(2))}</h2>
    if (line.startsWith('- '))  return <li key={i} className={styles.listItem}>{parseInline(line.slice(2))}</li>
    if (line.trim() === '')     return <br key={i} />
    return <p key={i} className={styles.para}>{parseInline(line)}</p>
  })
}

export default function ArticleReader({ article, cache, onCache, onClose }) {
  const [phase, setPhase]     = useState(cache[article.id] ? 'done' : 'loading')
  const [content, setContent] = useState(cache[article.id] || '')
  const overlayRef            = useRef(null)

  useEffect(() => {
    if (cache[article.id]) return
    fetchArticle(article.title, article.topic)
      .then(text => {
        onCache(article.id, text)
        setContent(text)
        setPhase('done')
      })
      .catch(e => {
        setContent(e.message)
        setPhase('error')
      })
  }, [article.id])

  const handleOverlayClick = e => {
    if (e.target === overlayRef.current) onClose()
  }

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        onAnimationEnd={e => { e.currentTarget.style.willChange = 'auto' }}
      >
        <div className={styles.modalHeader}>
          <div className={styles.tag}>{article.tag}</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <h2 className={styles.title}>{article.title}</h2>
        <p className={styles.meta}><i className="bi bi-clock" /> {article.readTime}</p>

        <div className={styles.body}>
          {phase === 'loading' && (
            <div className={styles.skeleton}>
              {[100, 90, 100, 75, 100, 85, 60, 100, 80, 70].map((w, i) => (
                <div key={i} className={styles.skLine} style={{ width: `${w}%` }} />
              ))}
            </div>
          )}

          {phase === 'done' && renderMarkdown(content)}

          {phase === 'error' && (
            <p className={styles.errorMsg}><i className="bi bi-exclamation-triangle-fill" /> {content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
