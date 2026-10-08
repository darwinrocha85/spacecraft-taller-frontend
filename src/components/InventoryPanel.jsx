import { useEffect, useState } from 'react'
import repairApi from '../api/repairApi'

// Bloque Almacén (mismo back, prefijo /api/inventory/*).
// Existencias por almacén, solo lectura. El back deriva el reparto 70/30
// del stock total hasta persistir stock por almacén (ver aviso en el alta).
export default function InventoryPanel({ refreshKey = 0 }) {
  const [overview, setOverview] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [quants, setQuants] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [ov, wh, q] = await Promise.all([
          repairApi.getInventoryOverview(),
          repairApi.getWarehouses(),
          repairApi.getQuants(),
        ])
        if (!cancelled) {
          setOverview(ov)
          setWarehouses(wh)
          setQuants(q)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  if (loading) return <p className="schedule-hint">Cargando almacén…</p>
  if (error) return <p className="field-error">{error}</p>

  return (
    <div>
      <p className="schedule-hint">
        {overview?.partsCount ?? 0} repuestos · almacenes {(overview?.warehouses ?? []).join(' + ')}
        {overview?.lowStock?.length > 0 && ` · stock bajo: ${overview.lowStock.join(', ')}`}
        {' '}· reparto demo 70/30 del stock total.
      </p>

      <div className="table-wrapper">
        <table className="spacecraft-table">
          <thead>
            <tr>
              <th>Almacén</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.code}>
                <td className="col-name">{w.code}</td>
                <td>{w.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-wrapper">
        <table className="spacecraft-table">
          <thead>
            <tr>
              <th>Repuesto</th>
              <th>Almacén</th>
              <th>Disponible</th>
            </tr>
          </thead>
          <tbody>
            {quants.map((q) => (
              <tr key={`${q.sparePartId}-${q.warehouse}`}>
                <td className="col-name">{q.sparePartName}</td>
                <td>{q.warehouse}</td>
                <td>{q.available}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
