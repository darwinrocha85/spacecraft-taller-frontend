import { IconClock } from './icons'

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Historial de naves que pasaron por el taller: una fila por visita ya entregada,
// con las fechas de ingreso/entrega y un acceso al detalle completo de esa nave.
export default function WorkshopHistory({ items, onShowHistory }) {
  if (items.length === 0) {
    return <p className="schedule-hint">Todavía no hay naves con visitas terminadas en el taller.</p>
  }

  return (
    <div className="table-wrapper">
      <table className="spacecraft-table">
        <thead>
          <tr>
            <th>Nave</th>
            <th>Modelo</th>
            <th>Daños</th>
            <th>Ingreso</th>
            <th>Entrega</th>
            <th className="col-actions">Historial</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td className="col-name">{r.spacecraftName}</td>
              <td>
                {r.spacecraftModel ? (
                  <span className="franchise-badge">{r.spacecraftModel}</span>
                ) : (
                  '—'
                )}
              </td>
              <td>
                {r.damages?.length > 0 ? (
                  <div className="damage-chip-list">
                    {r.damages.map((d, i) => (
                      <span className="damage-chip" key={i}>
                        {d.subtype}
                      </span>
                    ))}
                  </div>
                ) : (
                  '—'
                )}
              </td>
              <td className="repair-record-dates">{formatDateTime(r.createdAt)}</td>
              <td className="repair-record-dates">{formatDateTime(r.deliveredAt)}</td>
              <td className="col-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onShowHistory(r)}
                  aria-label={`Historial de ${r.spacecraftName}`}
                >
                  <IconClock />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}