// apps/web/src/app/(auth)/verify-email/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Token de verificação não encontrado')
      return
    }

    const verifyEmail = async () => {
      try {
        await apiClient.verifyEmail(token)
        setStatus('success')
        
        // Redireciona para login após 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
        
      } catch (error) {
        setStatus('error')
        setErrorMessage(
          error instanceof Error 
            ? error.message 
            : 'Erro ao verificar email. Token inválido ou expirado.'
        )
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verificando seu email...</h1>
            <p className="text-gray-600">Por favor, aguarde enquanto confirmamos seu email.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-600 mb-2">Email verificado com sucesso!</h1>
            <p className="text-gray-600 mb-6">
              Sua conta foi ativada. Você será redirecionado para a página de login em alguns segundos.
            </p>
            <Link
              href="/login"
              className="inline-block bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition-all"
            >
              Ir para Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-2">Erro na verificação</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Link
                href="/register"
                className="block bg-green-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-800 transition-all"
              >
                Criar nova conta
              </Link>
              <Link
                href="/resend-verification"
                className="block text-green-700 underline"
              >
                Reenviar email de verificação
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}