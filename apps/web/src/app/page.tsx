'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { 
  Trophy, 
  Users, 
  Target,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Coins,
  GamepadIcon,
  Crown,
  User,
  LogOut,
  Settings
} from 'lucide-react';

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Logo Betola"
                width={120}
                height={48}
                priority
                className="h-12 w-auto"
              />
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <NotificationBell />
                  
                  <Link href="/leagues">
                    <Button variant="outline" className="border-2 border-green-200 hover:border-green-300">
                      Minhas Ligas
                    </Button>
                  </Link>

                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" className="border-2 border-orange-200 hover:border-orange-300 text-orange-600">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-green-50"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.profile?.displayName?.[0] || user.username?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-medium">{user.profile?.displayName || user.username}</span>
                    </Button>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        <Link href="/profile">
                          <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            <Settings className="h-4 w-4" />
                            Editar Perfil
                          </div>
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button variant="outline" className="border-2 border-green-200 hover:border-green-300">
                      Criar Conta
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                      Entrar
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Aposte
              </span>{' '}
              <span className="text-gray-800">com</span>{' '}
              <span className="text-gray-800">
                Seus Amigos
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              A plataforma de apostas esportivas mais divertida do Brasil. 
              Crie ligas privadas, compete com amigos e use moeda virtual para apostar!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-4">
                  <Play className="h-5 w-5 mr-2" />
                  Começar Agora
                </Button>
              </Link>
              <Link href="/matches">
                <Button size="lg" variant="outline" className="border-2 border-green-300 hover:border-green-400 text-lg px-8 py-4">
                  Ver Partidas
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                100% Gratuito
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
                <Coins className="h-4 w-4 mr-2" />
                Moeda Virtual
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 px-4 py-2 text-sm">
                <Users className="h-4 w-4 mr-2" />
                Ligas Privadas
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Por que escolher o Betola?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Apostas esportivas sociais sem riscos financeiros, com toda a emoção do futebol
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-8 border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ligas Privadas</h3>
              <p className="text-gray-600 leading-relaxed">
                Crie ligas exclusivas com seus amigos e familiares. 
                Use códigos de convite para manter sua liga privada e segura.
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white mb-6">
                <Coins className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Betoletas</h3>
              <p className="text-gray-600 leading-relaxed">
                Nossa moeda virtual permite apostar sem riscos financeiros. 
                Todos começam com 1000 betoletas para se divertir!
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-xl bg-white/70 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full text-white mb-6">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Rankings</h3>
              <p className="text-gray-600 leading-relaxed">
                Compete com seus amigos em rankings dinâmicos. 
                Veja quem são os melhores apostadores da sua liga!
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Em poucos passos você estará apostando com seus amigos
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Crie sua Conta</h3>
                <p className="text-gray-600">
                  Cadastre-se gratuitamente e ganhe 1000 betoletas para começar
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500 text-white rounded-full text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Entre em uma Liga</h3>
                <p className="text-gray-600">
                  Crie sua liga ou use um código para entrar em ligas de amigos
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-full text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Aposte e Compita</h3>
                <p className="text-gray-600">
                  Faça suas apostas e veja quem consegue os melhores resultados!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para Começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de usuários que já se divertem apostando com amigos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-4">
                <Crown className="h-5 w-5 mr-2" />
                Criar Conta Grátis
              </Button>
            </Link>
            <Link href="/leagues">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4">
                Ver Ligas
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Logo Betola"
                  width={80}
                  height={32}
                  className="h-8 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400">
                A plataforma de apostas esportivas sociais mais divertida do Brasil.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/matches" className="hover:text-white transition-colors">Partidas</Link></li>
                <li><Link href="/leagues" className="hover:text-white transition-colors">Ligas</Link></li>
                <li><Link href="/apostas" className="hover:text-white transition-colors">Apostas</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Perfil</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Conta</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white transition-colors">Criar Conta</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Meu Perfil</Link></li>
                <li><Link href="/minhas-apostas" className="hover:text-white transition-colors">Minhas Apostas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Betola. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
