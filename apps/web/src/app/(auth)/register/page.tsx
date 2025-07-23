// apps/web/src/app/register/page.tsx
'use client'

import { useState } from 'react'
import { User, Mail, Eye } from 'lucide-react'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {/* Container principal: logo + card de cadastro */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-none w-full">
        
        {/* Logo fora do card, à esquerda */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <img
            src="/logo.svg"
            alt="Logo Betola"
            className="w-96 md:w-[36rem] lg:w-[44rem]"
          />
        </div>

        {/* Card de cadastro */}
        <div className="bg-[#FAFBEF] w-full max-w-md p-8 rounded-2xl shadow-md flex flex-col gap-6 justify-center">
          {/* Username */}
          <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
            <User size={18} className="mr-2 text-white" />
            <input
              type="text"
              placeholder="CRIE SEU USERNAME"
              className="bg-transparent outline-none w-full placeholder:text-white"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          {/* E‑mail */}
          <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
            <Mail size={18} className="mr-2 text-white" />
            <input
              type="email"
              placeholder="DIGITE SEU E‑MAIL"
              className="bg-transparent outline-none w-full placeholder:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
            <Eye size={18} className="mr-2 text-white" />
            <input
              type="password"
              placeholder="CRIE SUA SENHA"
              className="bg-transparent outline-none w-full placeholder:text-white"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>

          {/* Botão Criar Conta */}
          <button className="bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition-all">
            CRIAR CONTA
          </button>

          {/* Separador */}
          <div className="flex items-center justify-between gap-4">
            <hr className="flex-1 border-gray-400" />
            <span className="text-gray-600 text-sm">OU</span>
            <hr className="flex-1 border-gray-400" />
          </div>

          {/* Link para Login */}
          <p className="text-center text-sm">
            Já tem conta?{' '}
            <a href="/login" className="text-green-900 font-medium underline">
              Faça Login!
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
