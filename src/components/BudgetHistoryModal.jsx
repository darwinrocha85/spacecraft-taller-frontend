import { useEffect, useState } from 'react'
import repairApi from '../api/repairApi'
import { IconCoins } from './icons'

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function budgetStatusLabel(status) {
  switch (status) {
    case 'PENDIENTE':
      return 'Pendiente'
    case 'APROBADO':
      return 'Aprobado'
    case 'RECHAZADO':
      return 'Rechazado'
    default:
      return status
  }
}

export default function BudgetHistoryModal({ open, repair, onClose }) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!open || !repair) return
    setNotice('')
    setLoading(true)
    repairApi
      .getBudgets(repair.id)
      .then(setBudgets)
      .catch((err) => setNotice(err.message))
      .finally(() => setLoading(false))
  }, [open, repair])

  if (!open) return null

  return (
    <div className="modal-overlay modal-overlay-top" role="presentation" onClick={onClose}>
      <div className="modal-card schedule-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>
          <IconCoins />
          Presupuestos — {repair.spacecraftName}
        </h2>

        {notice && <p className="field-error">{notice}</p>}
        {loading && <p className="schedule-hint">Cargando presupuestos…</p>}

        {!loading && budgets.length === 0 && (
          <p className="schedule-hint">No hay presupuestos para esta entrada al taller.</p>
        )}

        {!loading && budgets.length > 0 && (
          <div className="repair-record-list">
            {budgets.map((b) => (
              <div className="repair-record-card" key={b.id}>
                <div className="repair-record-head">
                  <span className={`status-badge status-${b.status.toLowerCase()}`}>
                    {budgetStatusLabel(b.status)}
                  </span>
                  <span className="repair-record-dates">{formatDateTime(b.createdAt)}</span>
                </div>

                <div className="budget-parts-list" style={{ maxHeight: 'none', marginBottom: '8px' }}>
                  {b.lineItems.map((li) => (
                    <div className="budget-part-row" key={li.id}>
                      <span className="budget-part-name">{li.sparePartName}</span>
                      <span className="budget-part-price">
                        ${li.unitPrice.toFixed(2)} × {li.quantity}
                      </span>
                      <span className="budget-part-price" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${li.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="budget-total" style={{ textAlign: 'right', margin: 0 }}>
                  Total: <strong>${b.totalAmount.toFixed(2)}</strong>
                  {b.status !== 'PENDIENTE' && b.decidedAt && (
                    <span className="repair-record-dates" style={{ marginLeft: '10px' }}>
                      → {formatDateTime(b.decidedAt)}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
