// apps/web/src/app/reset-password/page.tsx
'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')

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

        {/* Card de redefinição de senha */}
        <div className="bg-[#FAFBEF] w-full max-w-md p-8 rounded-2xl shadow-md flex flex-col gap-6 justify-center">
          {/* Campo nova senha */}
          <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
            <Eye size={18} className="mr-2 text-white" />
            <input
              type="password"
              placeholder="DIGITE SUA NOVA SENHA"
              className="bg-transparent outline-none w-full placeholder:text-white"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
            />
          </div>

          {/* Campo confirmar senha */}
          <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
            <Eye size={18} className="mr-2 text-white" />
            <input
              type="password"
              placeholder="CONFIRME SUA NOVA SENHA"
              className="bg-transparent outline-none w-full placeholder:text-white"
              value={confirmaSenha}
              onChange={e => setConfirmaSenha(e.target.value)}
            />
          </div>

          {/* Botão Redefinir Senha */}
          <button className="bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition-all">
            REDEFINIR SENHA
          </button>

          {/* Separador simples */}
          <hr className="border-gray-400" />

          {/* Link para voltar ao login */}
          <p className="text-center text-sm">
            <Link href="/login" className="text-green-900 font-medium underline">
              Voltar ao Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
