import { useEffect, useState } from 'react'
import repairApi from '../api/repairApi'
import { IconCoins } from './icons'

// Fase 1: el taller arma un presupuesto eligiendo repuestos de su stock. El total sale de sumar
// precio × cantidad de cada repuesto elegido - no hay campo de mano de obra en esta demo.
export default function BudgetForm({ open, repair, onClose, onCreated }) {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!open) return
    setNotice('')
    setSelected({})
    setLoading(true)
    repairApi
      .getSpareParts(true)
      .then(setParts)
      .catch((err) => setNotice(err.message))
      .finally(() => setLoading(false))
  }, [open])

  if (!open) return null

  function updateQuantity(partId, quantity) {
    setSelected((prev) => {
      const next = { ...prev }
      if (!quantity || quantity <= 0) {
        delete next[partId]
      } else {
        next[partId] = quantity
      }
      return next
    })
  }

  const items = Object.entries(selected).map(([partId, quantity]) => ({
    sparePartId: Number(partId),
    quantity,
  }))
  const total = items.reduce((sum, item) => {
    const part = parts.find((p) => p.id === item.sparePartId)
    return sum + (part ? part.price * item.quantity : 0)
  }, 0)

  async function handleSubmit() {
    setSaving(true)
    setNotice('')
    try {
      await repairApi.createBudget(repair.id, items)
      onCreated?.()
    } catch (err) {
      setNotice(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card schedule-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>
          <IconCoins />
          Presupuesto — {repair.spacecraftName}
        </h2>

        {notice && <p className="field-error">{notice}</p>}
        {loading && <p className="schedule-hint">Cargando repuestos…</p>}

        {!loading && parts.length === 0 && (
          <p className="schedule-hint">
            No hay repuestos cargados. Cargá stock desde &ldquo;Stock de repuestos&rdquo; primero.
          </p>
        )}

        {!loading && parts.length > 0 && (
          <div className="budget-parts-list">
            {parts.map((part) => (
              <div className="budget-part-row" key={part.id}>
                <span className="budget-part-name">{part.name}</span>
                <span className="budget-part-price">${part.price.toFixed(2)}</span>
                <input
                  type="number"
                  min="0"
                  className="budget-part-qty"
                  value={selected[part.id] ?? ''}
                  placeholder="0"
                  onChange={(e) => updateQuantity(part.id, Number(e.target.value))}
                  disabled={saving}
                />
              </div>
            ))}
          </div>
        )}

        <p className="budget-total">
          Total: <strong>${total.toFixed(2)}</strong>
        </p>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving || items.length === 0}
          >
            Enviar presupuesto
          </button>
        </div>
      </div>
    </div>
  )
}
