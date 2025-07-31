'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Target, 
  Users, 
  User,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { AuthProvider } from '@/components/auth/auth-provider'
import { useAuthStore } from '@/stores/auth-store'

const navigation = [
  { name: 'Partidas', href: '/matches', icon: Trophy },
  { name: 'Minhas Apostas', href: '/minhas-apostas', icon: Target },
  { name: 'Ligas', href: '/leagues', icon: Users },
  { name: 'Perfil', href: '/profile', icon: User },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { logout: clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try {
      await apiClient.logout()
      clearAuth()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      clearAuth()
      window.location.href = '/login'
    }
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <img src="/logo.svg" alt="Betola" className="h-8 w-auto" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r">
        <div className="flex items-center h-16 px-6 border-b">
          <img src="/logo.svg" alt="Betola" className="h-8 w-auto" />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="flex h-16 items-center justify-between px-4 border-b bg-white lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <img src="/logo.svg" alt="Betola" className="h-6 w-auto" />
          <div className="w-8" />
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
    </AuthProvider>
  )
}