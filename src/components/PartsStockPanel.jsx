import { useEffect, useState } from 'react'
import repairApi from '../api/repairApi'
import { IconToolbox, IconBan, IconRefresh } from './icons'

// Fase 1: el taller carga y mantiene su propio stock de repuestos (nombre + precio + cantidad
// opcional informativa). Es una lista de precios simple para esta demo: aprobar un presupuesto
// no descuenta stock ni valida disponibilidad.
export default function PartsStockPanel({ open, onClose }) {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    repairApi
      .getSpareParts(false)
      .then(setParts)
      .catch((err) => setNotice(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!open) return
    setNotice('')
    load()
  }, [open])

  if (!open) return null

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim() || !price) return
    setSaving(true)
    setNotice('')
    try {
      await repairApi.createSparePart({
        name: name.trim(),
        price: Number(price),
        stockQuantity: stock ? Number(stock) : null,
      })
      setName('')
      setPrice('')
      setStock('')
      load()
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
    } catch (err) {
      setNotice(err.message)
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div className="modal-card schedule-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>
          <IconToolbox />
          Stock de repuestos
        </h2>

        {notice && <p className="field-error">{notice}</p>}

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
          <button type="submit" className="btn btn-primary" disabled={saving || !name.trim() || !price}>
            + Agregar
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
                  <th>Stock</th>
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

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
