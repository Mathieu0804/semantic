// src/hooks/useApi.ts
// Hook pour gérer les appels API avec états de chargement et erreurs

'use client'

import { useState, useCallback } from 'react'

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  success: boolean
  execute: (options?: RequestInit) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(url: string): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const execute = useCallback(async (options?: RequestInit) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || result.details || 'Erreur serveur')
      }

      setData(result)
      setSuccess(true)
      return result

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [url])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setSuccess(false)
    setLoading(false)
  }, [])

  return { data, loading, error, success, execute, reset }
}

// Hook pour les opérations CRUD
export function useCrud<T>(baseUrl: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await response.json()
      
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erreur lors de la création')
      }
      
      return result.product || result.service || result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
      return null
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  const update = useCallback(async (id: string, data: Partial<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${baseUrl}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })
      
      const result = await response.json()
      
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erreur lors de la modification')
      }
      
      return result.product || result.service || result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
      return null
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${baseUrl}?id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Erreur lors de la suppression')
      }
      
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  return { create, update, remove, loading, error }
}