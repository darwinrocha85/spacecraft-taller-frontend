import { useState, useRef, useEffect } from 'react'

// Widget de chat del taller — consulta y modifica datos EN VIVO del ciclo de reparación
// (naves en el taller, presupuestos, stock de repuestos) vía la Cloud Function `askTaller`
// (Fase 11.1, ver claude/fase11-1-estado.md en el proyecto). Mismo patrón burbuja+panel que
// AdminAssistantWidget.jsx de spacecraftSystem-frontend, adaptado a la paleta de este panel
// (un solo acento ámbar en vez del gradiente púrpura/cian del admin) y a las preguntas propias
// del personal de taller.
//
// A diferencia del admin, `askTaller` NO tiene acciones con advertencia (nada destructivo:
// desactivar un repuesto es reversible) — así que este widget no necesita ningún flujo de
// confirmación de dos turnos, solo mostrar la respuesta.
//
// `spacecraft-taller-frontend` es su propio proyecto de Hosting, sin las Cloud Functions
// propias (esas viven en el proyecto `spacecraft-system`, junto con `askAdmin` y el servidor
// MCP) — por eso en producción se pega directo a la URL pública de la Function en vez de un
// rewrite de Hosting como usa el panel admin (`/api/ask-admin`).

const SUGGESTIONS = [
  '¿Qué naves están en el taller ahora?',
  '¿Qué repuestos tenemos en stock?',
  '¿Hay presupuestos pendientes de aprobación?',
]

// Igual criterio que AdminAssistantWidget: tope de mensajes previos mandados como historial
// por pregunta nueva, para no inflar el request sin límite en una charla larga. El backend
// (ask-taller.js) vuelve a acotar esto igual, esto es solo para no mandar de más.
const MAX_HISTORY_MESSAGES = 12

function getApiUrl() {
  if (import.meta.env.DEV) {
    return 'http://localhost:5001/spacecraft-system/us-central1/askTaller'
  }
  // Sin rewrite de Hosting en este proyecto: URL pública directa de la Cloud Function
  // (2nd gen, alias cloudfunctions.net) en el proyecto spacecraft-system.
  return 'https://us-central1-spacecraft-system.cloudfunctions.net/askTaller'
}

export default function TallerAssistantWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hola — soy el asistente del taller. Puedo consultar qué naves están en reparación y en qué estado, armar presupuestos con el stock de repuestos, y ayudarte a mantener ese stock. La primera consulta puede tardar hasta un minuto si el backend estaba inactivo (arranque en frío de Render).',
    },
  ])
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading])

  async function send(text) {
    const question = (text ?? input).trim()
    if (!question || loading) return

    // El saludo inicial (índice 0) es solo de la UI, nunca vino del modelo — no se manda
    // como historial real.
    const history = messages.slice(1).slice(-MAX_HISTORY_MESSAGES).map((m) => ({ role: m.role, text: m.text }))

    setMessages((m) => [...m, { role: 'user', text: question }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setMessages((m) => [...m, { role: 'assistant', text: data.answer }])
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'No pude consultar ahora. Si el backend estaba inactivo puede tardar hasta un minuto — intenta de nuevo en unos segundos.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className={`assistant-bubble ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente del taller'}
      >
        {open ? (
          '×'
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="9" width="18" height="11" rx="4" />
              <circle cx="9" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
              <path d="M12 9V5.5" />
              <circle cx="12" cy="3.8" r="1.3" />
              <path d="M18.5 3l1 1.8 1.8 1-1.8 1-1 1.8-1-1.8-1.8-1 1.8-1 1-1.8z" fill="currentColor" stroke="none" />
            </svg>
            <span>Asistente</span>
          </>
        )}
      </button>

      {open && (
        <div className="assistant-panel" role="dialog" aria-label="Asistente del taller">
          <div className="assistant-header">
            <strong>Asistente del taller</strong>
            <button className="assistant-close" onClick={() => setOpen(false)} aria-label="Cerrar">
              ×
            </button>
          </div>

          <div className="assistant-messages" ref={listRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`assistant-msg ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="assistant-msg assistant">Consultando datos en vivo…</div>}
          </div>

          <div className="assistant-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>

          <div className="assistant-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ej: ¿cuánto sale reparar el casco?"
              maxLength={500}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}>
              Enviar
            </button>
          </div>
          <p className="assistant-hint">Datos en vivo del taller. Aprobar o rechazar un presupuesto se hace desde el panel admin.</p>
        </div>
      )}
    </>
  )
}
