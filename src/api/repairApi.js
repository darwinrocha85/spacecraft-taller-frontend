import axios from 'axios'

// Fase 1 (extracción del taller a backend Python): esta app ahora habla con DOS backends.
// Java (spacecraftSystem) sigue siendo dueño de la flota (solo se usa para la lista de naves,
// nombre/franquicia/estado OPERATIVA-EN_TALLER); todo el detalle de la reparación (estado fino,
// presupuestos, stock de repuestos) vive en spacecraft-taller-backend (Python).
const DEFAULT_JAVA_API_URL = import.meta.env.DEV
  ? 'http://localhost:8080/api'
  : 'https://spacecraftsystem.onrender.com/api'
const JAVA_API_URL = import.meta.env.VITE_API_URL || DEFAULT_JAVA_API_URL

const DEFAULT_TALLER_API_URL = import.meta.env.DEV
  ? 'http://localhost:8001/api'
  : 'https://spacecraft-taller-backend.onrender.com/api'
const TALLER_API_URL = import.meta.env.VITE_TALLER_API_URL || DEFAULT_TALLER_API_URL

const javaClient = axios.create({
  baseURL: JAVA_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const tallerClient = axios.create({
  baseURL: TALLER_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

function toFriendlyError(error, apiUrl) {
  if (error.response) {
    // Java devuelve {"message": ...}, el backend de taller (Python/FastAPI) devuelve
    // {"detail": ...} - se soportan ambos formatos.
    const backendMessage = error.response.data?.detail || error.response.data?.message
    const err = new Error(backendMessage || `Error ${error.response.status} del servidor`)
    err.status = error.response.status
    return err
  }
  if (error.request) {
    return new Error('No se pudo contactar al backend. ¿Está corriendo en ' + apiUrl + '?')
  }
  return error
}

export const repairApi = {
  // --- Flota (Java) ---
  async getSpacecrafts() {
    try {
      const { data } = await javaClient.get('/spacecrafts')
      return data
    } catch (error) {
      throw toFriendlyError(error, JAVA_API_URL)
    }
  },

  // --- Catálogo de daños (taller) ---
  async getDamageCatalog() {
    try {
      const { data } = await tallerClient.get('/catalog/damages')
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  // --- Reparaciones (taller) ---
  async getShopRepairs(status) {
    try {
      const { data } = await tallerClient.get('/repairs', { params: status ? { status } : {} })
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async getRepairsForSpacecraft(spacecraftId) {
    try {
      const { data } = await tallerClient.get('/repairs', { params: { spacecraftId } })
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async getRepairDetail(repairId) {
    try {
      const { data } = await tallerClient.get(`/repairs/${repairId}`)
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async confirmReceipt(repairId) {
    try {
      const { data } = await tallerClient.post(`/repairs/${repairId}/confirm-receipt`)
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async advanceStatus(repairId, status) {
    try {
      const { data } = await tallerClient.patch(`/repairs/${repairId}/status`, { status })
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  // --- Presupuestos (taller) ---
  async getBudgets(repairId) {
    try {
      const { data } = await tallerClient.get(`/repairs/${repairId}/budgets`)
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async createBudget(repairId, items) {
    try {
      const { data } = await tallerClient.post(`/repairs/${repairId}/budgets`, { items })
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  // --- Stock de repuestos (taller) ---
  async getSpareParts(activeOnly = true) {
    try {
      const { data } = await tallerClient.get('/parts', { params: { active: activeOnly } })
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async createSparePart(part) {
    try {
      const { data } = await tallerClient.post('/parts', part)
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async updateSparePart(partId, changes) {
    try {
      const { data } = await tallerClient.patch(`/parts/${partId}`, changes)
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },

  async deactivateSparePart(partId) {
    try {
      const { data } = await tallerClient.delete(`/parts/${partId}`)
      return data
    } catch (error) {
      throw toFriendlyError(error, TALLER_API_URL)
    }
  },
}

export default repairApi
