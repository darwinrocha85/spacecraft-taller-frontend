import { useState } from 'react'
import Header from './components/Header'
import RepairCard from './components/RepairCard'
import RepairHistoryModal from './components/RepairHistoryModal'
import WorkshopHistory from './components/WorkshopHistory'
import PartsStockPanel from './components/PartsStockPanel'
import Toast from './components/Toast'
import { IconToolbox, IconAlert, IconWrench, IconClock } from './components/icons'
import useShopRepairs from './hooks/useShopRepairs'

export default function App() {
  const { all: repairs, loading, error, refetch } = useShopRepairs()
  const [historyTarget, setHistoryTarget] = useState(null)
  const [showParts, setShowParts] = useState(false)
  const [toast, setToast] = useState(null)

  const activeRepairs = repairs.filter((r) => r.status !== 'ENTREGADA')
  const historyRepairs = repairs
    .filter((r) => r.status === 'ENTREGADA')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  async function handleChanged() {
    await refetch()
  }

  function openHistory(repair) {
    setHistoryTarget({ id: repair.spacecraftId, name: repair.spacecraftName })
  }

  return (
    <div className="app-shell">
      <main className="app-content">
        <Header inTallerCount={activeRepairs.length} />

        <div className="taller-toolbar">
          <button type="button" className="btn btn-ghost" onClick={() => setShowParts(true)}>
            <IconToolbox />
            Stock de repuestos
          </button>
        </div>

        {error && (
          <div className="inline-error" role="alert">
            <IconAlert />
            {error}
          </div>
        )}

        {loading && (
          <div className="table-state">
            <div className="spinner" aria-hidden="true" />
            <p>Cargando el taller…</p>
          </div>
        )}

        {!loading && (
          <>
            <section className="taller-section">
              <h2 className="section-title">
                <IconWrench />
                Naves en el taller
              </h2>
              {activeRepairs.length === 0 ? (
                <p className="schedule-hint">
                  Ninguna nave está en el taller ahora. Envíala desde el panel admin para empezar.
                </p>
              ) : (
                <div className="repair-card-grid">
                  {activeRepairs.map((r) => (
                    <RepairCard
                      key={r.id}
                      repair={r}
                      onChanged={handleChanged}
                      onShowHistory={() => openHistory(r)}
                      onToast={setToast}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="taller-section">
              <h2 className="section-title">
                <IconClock />
                Historial del taller
              </h2>
              <WorkshopHistory items={historyRepairs} onShowHistory={openHistory} />
            </section>
          </>
        )}
      </main>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <RepairHistoryModal
        open={Boolean(historyTarget)}
        spacecraft={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />

      <PartsStockPanel open={showParts} onClose={() => setShowParts(false)} />
    </div>
  )
}