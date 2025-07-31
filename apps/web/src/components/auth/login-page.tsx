"use client"

import * as React from "react"
import { useState } from "react"
import Cookies from "js-cookie"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  H1,
  Input,
  Label,
  P,
} from "@betola/ui"
import { API_URL } from '@/lib/api'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.")
      return
    }
    
    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido.")
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login falhou.');
      }
      
      Cookies.set('auth_token', data.accessToken, { expires: 1 });

      window.location.href = '/dashboard';

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    alert("Redirecionando para recuperação de senha (Demo)")
  }

  const handleCreateAccount = () => {
    window.location.href = '/register';
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
      
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='1' stroke='rgb(148 163 184 / 0.3)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card>
          <CardHeader className="items-center">
             <H1>Betola</H1>
             <CardTitle>Entrar na sua conta</CardTitle>
             <CardDescription>Bem-vindo de volta! Entre com suas credenciais.</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button
                    variant="link"
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm"
                  >
                    Esqueci minha senha
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="justify-center">
            <P className="text-sm">
              Não tem uma conta?{" "}
              <Button
                variant="link"
                onClick={handleCreateAccount}
                className="font-medium p-0 h-auto"
              >
                Criar conta
              </Button>
            </P>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage 