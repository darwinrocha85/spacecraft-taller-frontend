import { IconWrench } from './icons'

export default function Header({ inTallerCount }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-icon" aria-hidden="true">
          <IconWrench />
        </span>
        <div>
          <h1>Taller de Reparación</h1>
          <p className="brand-subtitle">
            Gestión interna de flota ·{' '}
            <strong>
              {inTallerCount} nave{inTallerCount === 1 ? '' : 's'} en el taller ahora
            </strong>
          </p>
        </div>
      </div>
    </header>
  )
}