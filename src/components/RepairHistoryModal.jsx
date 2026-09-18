import { useEffect, useState } from 'react'
import repairApi from '../api/repairApi'
import { repairStatusLabel } from '../constants/repairStatus'
import { IconWrench } from './icons'

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Fase 1: el historial ahora viene del backend de taller (Python), no de spacecraftSystem -
// muestra el detalle fino de cada visita (daños, snapshot de horarios/funciones cerrados, y en
// qué estado quedó), no la cantidad de entradas canceladas (eso es un detalle interno de Java).
export default function RepairHistoryModal({ open, spacecraft, onClose }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!open || !spacecraft) return
    setNotice('')
    setLoading(true)
    repairApi
      .getRepairsForSpacecraft(spacecraft.id)
      .then(setRecords)
      .catch((err) => setNotice(err.message))
      .finally(() => setLoading(false))
  }, [open, spacecraft])

  if (!open) return null

  return (
    <div
      className="modal-overlay modal-overlay-top"
      role="presentation"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div className="modal-card schedule-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>
          <IconWrench />
          Historial de taller — {spacecraft?.name}
        </h2>

        {notice && <p className="field-error">{notice}</p>}
        {loading && <p className="schedule-hint">Cargando historial…</p>}

        {!loading && records.length === 0 && (
          <p className="schedule-hint">Esta nave nunca ha estado en el taller.</p>
        )}

        {!loading && records.length > 0 && (
          <div className="repair-record-list">
            {records.map((r) => (
              <div className="repair-record-card" key={r.id}>
                <div className="repair-record-head">
                  <span className={`status-badge status-${r.status.toLowerCase()}`}>
                    {repairStatusLabel(r.status)}
                  </span>
                  <span className="repair-record-dates">
                    {formatDateTime(r.createdAt)} {r.deliveredAt ? `→ ${formatDateTime(r.deliveredAt)}` : '(en curso)'}
                  </span>
                </div>

                {r.damages?.length > 0 && (
                  <div className="damage-chip-list">
                    {r.damages.map((d, i) => (
                      <span className="damage-chip" key={i}>
                        {d.subtype}
                      </span>
                    ))}
                  </div>
                )}

                {(r.closedMuseumDates?.length > 0 || r.closedTheaterEvents?.length > 0) && (
                  <p className="repair-record-detail">
                    {r.closedMuseumDates?.length ?? 0} horario
                    {(r.closedMuseumDates?.length ?? 0) === 1 ? '' : 's'} de museo cerrado
                    {(r.closedMuseumDates?.length ?? 0) === 1 ? '' : 's'} · {r.closedTheaterEvents?.length ?? 0}{' '}
                    función{(r.closedTheaterEvents?.length ?? 0) === 1 ? '' : 'es'} de teatro cerrada
                    {(r.closedTheaterEvents?.length ?? 0) === 1 ? '' : 's'}
                  </p>
                )}
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
