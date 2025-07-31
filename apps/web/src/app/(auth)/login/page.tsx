// apps/web/src/app/(auth)/login/page.tsx
'use client'

import { useState, Suspense } from 'react'
import { User, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/stores/auth-store'
import { z } from 'zod'

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    // Valida dados
    try {
      const data = loginSchema.parse({ email, password })
      
      setIsLoading(true)
      
      const response = await apiClient.login(data as { email: string; password: string })
      console.log('Login response:', response)
      
      // Salva os dados do usuário na store
      const token = response.accessToken || 'authenticated';
      setAuth(response.user, token)
      
      // Redireciona para a página especificada no parâmetro redirect ou matches
      const redirectTo = searchParams.get('redirect') || '/dashboard'
      console.log('Redirecting to:', redirectTo)
      router.push(redirectTo)
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else if (error instanceof Error) {
        setGeneralError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
      style={{ 
        backgroundImage: "url('/login-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-none w-full">
        
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <Image
            src="/logo.svg"
            alt="Logo Betola"
            width={700}
            height={200}
            priority
            className="w-96 md:w-[36rem] lg:w-[44rem] h-auto"
          />
        </div>

        <form 
          onSubmit={handleSubmit}
          className="bg-[#FAFBEF] w-full max-w-md p-8 rounded-2xl shadow-md flex flex-col gap-6 justify-center"
        >
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              <p className="text-sm">{generalError}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
                <User size={18} className="mr-2 text-white" />
                <input
                  type="email"
                  placeholder="E-MAIL"
                  className="bg-transparent outline-none w-full placeholder:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1 ml-4">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
                <Lock size={18} className="mr-2 text-white" />
                <input
                  type="password"
                  placeholder="SENHA"
                  className="bg-transparent outline-none w-full placeholder:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1 ml-4">{errors.password}</p>
              )}
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-green-900 underline self-end -mt-2"
            >
              Esqueci minha SENHA!
            </Link>

            <button 
              type="submit"
              disabled={isLoading}
              className="bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <hr className="flex-1 border-gray-400" />
            <span className="text-gray-600 text-sm">OU</span>
            <hr className="flex-1 border-gray-400" />
          </div>

          <p className="text-center text-sm">
            Não tem uma conta ainda?{' '}
            <Link href="/register" className="text-green-900 font-medium underline">
              Crie uma agora!
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}