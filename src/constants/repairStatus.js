// Fase 1 (extracción del taller a backend Python): ahora hay DOS conceptos de estado separados:
//  - Spacecraft.status (spacecraftSystem/Java): solo OPERATIVA o EN_TALLER - lo único que le
//    importa al resto del sistema (venta de entradas, marketing, dashboard).
//  - Repair.status (spacecraft-taller-backend/Python): el detalle fino del ciclo de reparación.

export const SPACECRAFT_STATUS_LABELS = {
  OPERATIVA: 'Operativa',
  EN_TALLER: 'En taller',
}

export function spacecraftStatusLabel(status) {
  return SPACECRAFT_STATUS_LABELS[status || 'OPERATIVA'] ?? status
}

export function isOperativa(status) {
  return !status || status === 'OPERATIVA'
}

export const REPAIR_STATUS_LABELS = {
  ENVIADA: 'Enviada, esperando confirmación',
  RECIBIDA: 'Recibida',
  EN_REVISION: 'En revisión',
  EN_TRABAJO: 'En trabajo',
  ESPERANDO_APROBACION_PRESUPUESTO: 'Presupuesto enviado',
  LISTA_PARA_SALIR: 'Lista para retirar',
  ENTREGADA: 'Entregada',
}

export function repairStatusLabel(status) {
  return REPAIR_STATUS_LABELS[status] ?? status
}

// Única transición manual "de avance" disponible desde cada estado (el backend valida lo mismo,
// esto es solo para no ofrecer en la UI un botón que el backend va a rechazar).
export const NEXT_MANUAL_STATUS = {
  RECIBIDA: 'EN_REVISION',
  EN_REVISION: 'EN_TRABAJO',
  EN_TRABAJO: 'LISTA_PARA_SALIR',
}
