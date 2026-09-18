import { IconCheck, IconAlert, IconClose } from './icons'

export default function Toast({ message, type = 'error', onClose }) {
  if (!message) return null

  return (
    <div className={`toast toast-${type}`} role="alert">
      {type === 'success' ? <IconCheck /> : <IconAlert />}
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar aviso">
        <IconClose />
      </button>
    </div>
  )
}