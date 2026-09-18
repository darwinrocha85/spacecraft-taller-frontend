import { useCallback, useEffect, useState } from 'react'
import repairApi from '../api/repairApi'

// Trae TODAS las reparaciones del taller (activas y entregadas). La pantalla deriva de acá
// "en el taller ahora" (no entregadas) y el "historial de visitas" (entregadas).
export function useShopRepairs() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await repairApi.getShopRepairs()
      setAll(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { all, loading, error, refetch: fetchData }
}

export default useShopRepairs