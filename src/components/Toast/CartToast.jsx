import styles from './CartToast.module.css'

export default function CartToast({ message, type }) {
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <i className={`bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'}`} />
      {message}
    </div>
  )
}
