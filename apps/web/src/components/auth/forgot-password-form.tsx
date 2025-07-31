'use client'

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"

const CenterUnderline = ({ label }: { label: string }) => {
  return (
    <motion.span
      className="relative inline-block cursor-pointer"
      whileHover="visible"
    >
      <span>{label}</span>
      <motion.div
        className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-current"
        variants={{
          hidden: { width: 0 },
          visible: { width: "100%", transition: { duration: 0.25, ease: "easeInOut" } },
        }}
        initial="hidden"
      />
    </motion.span>
  );
};

interface ForgotPasswordFormProps {
  className?: string
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('');

  const onBackToLogin = () => {
    window.location.href = '/login';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao enviar o e-mail.');
      }
      
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border rounded-lg p-8 shadow-lg"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Verifique seu e-mail
            </h2>
            <p className="text-muted-foreground mb-6">
              Se uma conta com o e-mail <strong>{email}</strong> existir, nós enviamos um link para redefinir a senha.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Voltar ao login
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border rounded-lg p-8 shadow-lg"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Esqueceu sua senha?
          </h1>
          <p className="text-muted-foreground">
            Sem problemas. Digite seu e-mail e enviaremos um link para redefini-la.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-foreground mb-2"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              'Enviar link de redefinição'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <CenterUnderline 
              label="Voltar ao login"
            />
          </button>
        </div>
      </motion.div>
    </div>
  )
} 