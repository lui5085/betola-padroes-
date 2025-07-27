// apps/web/src/app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { User, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { z } from 'zod'

// Schema de validação
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username deve ter no mínimo 3 caracteres')
    .max(20, 'Username deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e _'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
})

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    setSuccessMessage('')

    // Valida dados
    try {
      const data = registerSchema.parse({ username, email, password })
      
      setIsLoading(true)
      
      await apiClient.register(data as { username: string; email: string; password: string })
      
      // Mostra mensagem de sucesso
      setSuccessMessage('Conta criada com sucesso! Verifique seu email para ativar sua conta.')
      
      // Limpa formulário
      setUsername('')
      setEmail('')
      setPassword('')
      
      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
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
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {/* Container principal: logo + card */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-none w-full">
        
        {/* Logo fora do card, à esquerda */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <img
            src="/logo.svg"
            alt="Logo Betola"
            className="w-96 md:w-[36rem] lg:w-[44rem]"
          />
        </div>

        {/* Card de registro */}
        <form 
          onSubmit={handleSubmit}
          className="bg-[#FAFBEF] w-full max-w-md p-8 rounded-2xl shadow-md flex flex-col gap-6 justify-center"
        >
          {/* Mensagem de sucesso */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle size={18} />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {/* Erro geral */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={18} />
              <p className="text-sm">{generalError}</p>
            </div>
          )}

          {/* Campos de entrada */}
          <div className="flex flex-col gap-4">
            {/* Campo username */}
            <div>
              <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
                <User size={18} className="mr-2 text-white" />
                <input
                  type="text"
                  placeholder="USERNAME"
                  className="bg-transparent outline-none w-full placeholder:text-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="text-red-600 text-sm mt-1 ml-4">{errors.username}</p>
              )}
            </div>

            {/* Campo email */}
            <div>
              <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
                <Mail size={18} className="mr-2 text-white" />
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

            {/* Campo senha */}
            <div>
              <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
                {showPassword ? (
                  <EyeOff
                    size={18}
                    className="mr-2 text-white cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    size={18}
                    className="mr-2 text-white cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
                <input
                  type={showPassword ? "text" : "password"}
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

            <button 
              type="submit"
              disabled={isLoading}
              className="bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
            </button>
          </div>

          {/* Separador */}
          <div className="flex items-center justify-between gap-4">
            <hr className="flex-1 border-gray-400" />
            <span className="text-gray-600 text-sm">OU</span>
            <hr className="flex-1 border-gray-400" />
          </div>

          {/* Link para login */}
          <p className="text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-green-900 font-medium underline">
              Entre agora!
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}