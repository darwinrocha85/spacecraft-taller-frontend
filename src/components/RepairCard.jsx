import { useState } from 'react'
import repairApi from '../api/repairApi'
import ConfirmDialog from './ConfirmDialog'
import BudgetForm from './BudgetForm'
import BudgetHistoryModal from './BudgetHistoryModal'
import { IconDownload, IconArrowRight, IconCoins, IconClock } from './icons'
import { repairStatusLabel, NEXT_MANUAL_STATUS } from '../constants/repairStatus'

export default function RepairCard({ repair, onChanged, onShowHistory, onToast }) {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showBudgetHistory, setShowBudgetHistory] = useState(false)
  const [confirmAdvance, setConfirmAdvance] = useState(null)

  const nextStatus = NEXT_MANUAL_STATUS[repair.status]

  async function handleConfirmReceipt() {
    setBusy(true)
    setNotice('')
    try {
      await repairApi.confirmReceipt(repair.id)
      await onChanged?.()
    } catch (err) {
      setNotice(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleAdvance() {
    setBusy(true)
    setNotice('')
    try {
      await repairApi.advanceStatus(repair.id, confirmAdvance)
      setConfirmAdvance(null)
      await onChanged?.()
    } catch (err) {
      setNotice(err.message)
      setConfirmAdvance(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="repair-card">
      <div className="repair-card-head">
        <div>
          <h3>{repair.spacecraftName}</h3>
          {repair.spacecraftModel && <span className="franchise-badge">{repair.spacecraftModel}</span>}
        </div>
        <span className={`status-badge status-${repair.status.toLowerCase()}`}>
          {repairStatusLabel(repair.status)}
        </span>
      </div>

      {notice && <p className="field-error">{notice}</p>}

      {repair.damages?.length > 0 && (
        <div className="damage-chip-list">
          {repair.damages.map((d, i) => (
            <span className="damage-chip" key={i}>
              {d.subtype}
            </span>
          ))}
        </div>
      )}

      <p className="repair-record-detail">
        Enviada el{' '}
        {new Date(repair.createdAt).toLocaleString('es-ES', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      <div className="repair-card-actions">
        {repair.status === 'ENVIADA' && (
          <button
            type="button"
            className="btn btn-primary btn-schedule"
            onClick={handleConfirmReceipt}
            disabled={busy}
          >
            <IconDownload />
            Confirmar recepción
          </button>
        )}

        {nextStatus && (
          <button
            type="button"
            className="btn btn-ghost btn-schedule"
            onClick={() => setConfirmAdvance(nextStatus)}
            disabled={busy}
          >
            <IconArrowRight />
            Avanzar a: {repairStatusLabel(nextStatus)}
          </button>
        )}

        {repair.status === 'EN_TRABAJO' && (
          <>
            <button
              type="button"
              className="btn btn-ghost btn-schedule"
              onClick={() => setShowBudgetForm(true)}
              disabled={busy}
            >
              <IconCoins />
              Hacer presupuesto
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-schedule"
              onClick={() => setShowBudgetHistory(true)}
              disabled={busy}
              style={{ marginLeft: '8px' }}
            >
              <IconCoins />
              Ver presupuestos
            </button>
          </>
        )}

        {repair.status === 'ESPERANDO_APROBACION_PRESUPUESTO' && (
          <>
            <p className="schedule-hint">
              Presupuesto enviado. Esperando que el dueño de la flota lo apruebe o rechace.
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-schedule"
              onClick={() => setShowBudgetHistory(true)}
              disabled={busy}
              style={{ marginTop: '8px' }}
            >
              <IconCoins />
              Ver presupuesto
            </button>
          </>
        )}

        {repair.status === 'LISTA_PARA_SALIR' && (
          <p className="schedule-hint">Lista para que el dueño de la flota la retire.</p>
        )}
      </div>

      <div className="modal-actions modal-actions-left repair-card-footer">
        <button type="button" className="btn btn-ghost btn-schedule" onClick={onShowHistory}>
          <IconClock />
          Historial
        </button>
      </div>

      <ConfirmDialog
        open={Boolean(confirmAdvance)}
        title="Cambiar estado"
        message={`"${repair.spacecraftName}" pasará a "${repairStatusLabel(confirmAdvance)}".`}
        onConfirm={handleAdvance}
        onCancel={() => !busy && setConfirmAdvance(null)}
      />

      <BudgetForm
        open={showBudgetForm}
        repair={repair}
        onClose={() => setShowBudgetForm(false)}
        onCreated={async () => {
          setShowBudgetForm(false)
          await onChanged?.()
          onToast?.({ message: 'Presupuesto creado, esperando aprobación del dueño de la flota.', type: 'success' })
        }}
      />

      <BudgetHistoryModal
        open={showBudgetHistory}
        repair={repair}
        onClose={() => setShowBudgetHistory(false)}
      />
    </div>
  )
}
