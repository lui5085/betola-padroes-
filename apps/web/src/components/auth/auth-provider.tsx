'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout, isAuthenticated } = useAuthStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3002/auth/profile', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const profile = await response.json()
          console.log('Auth check successful:', profile)
          setAuth(profile, 'authenticated')
        } else {
          console.log('Auth check failed:', response.status)
          logout()
        }
      } catch (error) {
        console.log('Auth check error:', error)
        logout()
      } finally {
        setIsInitialized(true)
      }
    }

    if (!isAuthenticated) {
      checkAuth()
    } else {
      setIsInitialized(true)
    }
  }, [setAuth, logout, isAuthenticated])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}