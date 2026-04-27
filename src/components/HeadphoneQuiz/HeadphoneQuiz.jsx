import { useState } from 'react'
import { products } from '../../products'
import ReviewModal from '../reviewModal/ReviewModal'
import styles from './HeadphoneQuiz.module.css'

const QUESTIONS = [
  { id: 'use',     label: 'Primary use?',             options: ['Music', 'Gaming', 'Travel', 'Work calls'] },
  { id: 'fit',     label: 'Preferred fit?',            options: ['Over-ear', 'On-ear', 'In-ear'] },
  { id: 'budget',  label: 'Budget?',                   options: ['Under $100', '$100–$300', '$300+'] },
  { id: 'feature', label: 'Most important feature?',   options: ['ANC', 'Sound quality', 'Battery life', 'Mic quality'] },
]

const SYSTEM_PROMPT = 'You are an expert audio product advisor for HeadWave. Based on the user\'s preferences, recommend the single best matching product from the provided catalogue. Respond in JSON only: { "productId": number, "reason": string (2 sentences max) }'

async function fetchRecommendation(answers) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('No API key. Create a .env file with VITE_GROQ_API_KEY=your-key')

  const catalogue = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    topSpecs: p.specs.slice(0, 4),
  }))

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `User preferences:\n- Primary use: ${answers.use}\n- Preferred fit: ${answers.fit}\n- Budget: ${answers.budget}\n- Most important feature: ${answers.feature}\n\nCatalogue:\n${JSON.stringify(catalogue, null, 2)}\n\nRespond with JSON only.` }
      ],
      max_tokens: 256
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  const raw = data.choices[0].message.content.trim()  // ← Groq format
    .replace(/^```json\s*/i, '').replace(/```\s*$/g, '').trim()
  return JSON.parse(raw)
}

export default function HeadphoneQuiz() {
  const [answers, setAnswers] = useState({ use: '', fit: '', budget: '', feature: '' })
  const [phase, setPhase] = useState('quiz') // quiz | loading | result | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [modalProduct, setModalProduct] = useState(null)

  const allAnswered = QUESTIONS.every(q => answers[q.id] !== '')

  const handleSubmit = async () => {
    if (!allAnswered) return
    setPhase('loading')
    setErrorMsg('')
    try {
      const { productId, reason } = await fetchRecommendation(answers)
      const product = products.find(p => p.id === productId)
      if (!product) throw new Error('Returned product ID not found in catalogue.')
      setResult({ product, reason })
      setPhase('result')
    } catch (e) {
      setErrorMsg(e.message)
      setPhase('error')
    }
  }

  const handleReset = () => {
    setAnswers({ use: '', fit: '', budget: '', feature: '' })
    setResult(null)
    setErrorMsg('')
    setPhase('quiz')
  }

  return (
    <div className={styles.quiz}>
      <div className={styles.header}>
        <i className="bi bi-stars" />
        <div>
          <h2>Find Your Perfect Headphone</h2>
          <p>Answer 4 questions and our AI advisor matches you instantly.</p>
        </div>
      </div>

      {(phase === 'quiz' || phase === 'loading' || phase === 'error') && (
        <div className={styles.questions}>
          {QUESTIONS.map(q => (
            <div key={q.id} className={styles.questionBlock}>
              <span className={styles.questionLabel}>{q.label}</span>
              <div className={styles.options}>
                {q.options.map(opt => (
                  <button
                    key={opt}
                    className={`${styles.option} ${answers[q.id] === opt ? styles.selected : ''}`}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    disabled={phase === 'loading'}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {phase === 'error' && (
        <p className={styles.errorMsg}><i className="bi bi-exclamation-triangle-fill" /> {errorMsg}</p>
      )}

      {(phase === 'quiz' || phase === 'loading' || phase === 'error') && (
        <button
          className={`${styles.submitBtn} ${(!allAnswered || phase === 'loading') ? styles.submitDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!allAnswered || phase === 'loading'}
        >
          {phase === 'loading'
            ? <><span className={styles.spinner} /> Finding your match…</>
            : <><i className="bi bi-stars" /> Find My Match</>
          }
        </button>
      )}

      {phase === 'result' && result && (
        <div className={styles.result}>
          <div className={styles.resultCard} onClick={() => setModalProduct(result.product)} role="button" tabIndex={0}>
            <img
              src={result.product.images[result.product.colors[0]]}
              alt={result.product.name}
              className={styles.resultImg}
            />
            <div className={styles.resultMeta}>
              <span className={styles.resultCategory}>{result.product.category}</span>
              <h3 className={styles.resultName}>{result.product.name}</h3>
              <span className={styles.resultPrice}>${result.product.price.toLocaleString()}</span>
              <span className={styles.resultCta}>View details <i className="bi bi-arrow-right" /></span>
            </div>
          </div>
          <div className={styles.reason}>
            <i className="bi bi-robot" />
            <p>{result.reason}</p>
          </div>
          <button className={styles.resetBtn} onClick={handleReset}>
            <i className="bi bi-arrow-counterclockwise" /> Try again
          </button>
        </div>
      )}

      {modalProduct && (
        <ReviewModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onSelectProduct={setModalProduct}
        />
      )}
    </div>
  )
}
