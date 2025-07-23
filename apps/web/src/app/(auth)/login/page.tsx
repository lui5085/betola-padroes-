'use client'

import { useState } from 'react'
import { User, Lock } from 'lucide-react'
import Link from 'next/link'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

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

        {/* Card de login reduzido para proporções típicas */}
        <div className="bg-[#FAFBEF] w-full max-w-md p-8 rounded-2xl shadow-md flex flex-col gap-6 justify-center">
          {/* Campos de entrada */}
          <div className="flex flex-col gap-4">
            {/* Campo usuário */}
            <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
              <User size={18} className="mr-2 text-white" />
              <input
                type="text"
                placeholder="USUÁRIO OU E-MAIL"
                className="bg-transparent outline-none w-full placeholder:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Campo senha */}
            <div className="flex items-center bg-gray-800 text-white px-4 py-3 rounded-full">
              <Lock size={18} className="mr-2 text-white" />
              <input
                type="password"
                placeholder="SENHA"
                className="bg-transparent outline-none w-full placeholder:text-white"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <Link
              href="/forgot-password"
              className="text-sm text-green-900 underline self-end -mt-2"
            >
              Esqueci minha SENHA!
            </Link>

            <button className="bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition-all">
              ENTRAR
            </button>
          </div>

          {/* Separador */}
          <div className="flex items-center justify-between gap-4">
            <hr className="flex-1 border-gray-400" />
            <span className="text-gray-600 text-sm">OU</span>
            <hr className="flex-1 border-gray-400" />
          </div>

          {/* Link para criar conta */}
          <p className="text-center text-sm">
            Não tem uma conta ainda?{' '}
            <Link href="/register" className="text-green-900 font-medium underline">
              Crie uma agora!
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
