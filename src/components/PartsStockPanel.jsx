import { useEffect, useState } from 'react'
import repairApi from '../api/repairApi'
import { IconBan, IconRefresh } from './icons'

const FALLBACK_WAREHOUSES = [
  { code: 'BCN-01', name: 'Barcelona principal' },
  { code: 'WAW-02', name: 'Varsovia este' },
]

// Gestión de repuestos inline (no popup): vive dentro de la vista Almacén.
// El alta exige almacén destino. El back aún no persiste stock por almacén
// (reparte el total 70/30 en /quants), así que se muestra explícitamente
// dónde se registra el alta y cómo la verá el usuario en existencias.
export default function PartsStockPanel({ refreshKey = 0, onChanged }) {
  const [parts, setParts] = useState([])
  const [warehouses, setWarehouses] = useState(FALLBACK_WAREHOUSES)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [warehouse, setWarehouse] = useState(FALLBACK_WAREHOUSES[0].code)
  const [saving, setSaving] = useState(false)
  const [lastCreated, setLastCreated] = useState(null)

  function load() {
    setLoading(true)
    Promise.all([
      repairApi.getSpareParts(false),
      repairApi.getWarehouses().catch(() => FALLBACK_WAREHOUSES),
    ])
      .then(([p, w]) => {
        setParts(p)
        if (Array.isArray(w) && w.length > 0) {
          setWarehouses(w)
          setWarehouse((prev) =>
            w.some((x) => x.code === prev) ? prev : w[0].code,
          )
        }
      })
      .catch((err) => setNotice(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setNotice('')
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || !price) return
    setSaving(true)
    setNotice('')
    try {
      const created = await repairApi.createSparePart({
        name: name.trim(),
        price: Number(price),
        stockQuantity: stock ? Number(stock) : null,
        warehouse,
      })
      setLastCreated({ name: created.name, warehouse })
      setName('')
      setPrice('')
      setStock('')
      load()
      if (onChanged) onChanged()
    } catch (err) {
      setNotice(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(part) {
    setNotice('')
    try {
      if (part.active) {
        await repairApi.deactivateSparePart(part.id)
      } else {
        await repairApi.updateSparePart(part.id, { active: true })
      }
      load()
      if (onChanged) onChanged()
    } catch (err) {
      setNotice(err.message)
    }
  }

  return (
    <div>
      {notice && <p className="field-error">{notice}</p>}
      {lastCreated && (
        <p className="schedule-hint">
          Alta de {lastCreated.name} registrada en {lastCreated.warehouse}. En existencias la verás
          repartida 70/30 (BCN/WAW) hasta que el back persista stock por almacén.
        </p>
      )}

      <form className="spare-part-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nombre del repuesto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={saving}
        />
        <input
          type="number"
          min="0"
          placeholder="Stock (opcional)"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          disabled={saving}
        />
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          disabled={saving}
          aria-label="Almacén destino"
        >
          {warehouses.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} — {w.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" disabled={saving || !name.trim() || !price}>
          + Agregar en {warehouse}
        </button>
      </form>

      {loading && <p className="schedule-hint">Cargando repuestos…</p>}

      {!loading && (
        <div className="table-wrapper">
          <table className="spacecraft-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock total</th>
                <th>Estado</th>
                <th className="col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id}>
                  <td className="col-name">{part.name}</td>
                  <td>${part.price.toFixed(2)}</td>
                  <td>{part.stockQuantity ?? '—'}</td>
                  <td>{part.active ? 'Activo' : 'Inactivo'}</td>
                  <td className="col-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleToggleActive(part)}
                      aria-label={part.active ? `Desactivar ${part.name}` : `Reactivar ${part.name}`}
                    >
                      {part.active ? <IconBan /> : <IconRefresh />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
