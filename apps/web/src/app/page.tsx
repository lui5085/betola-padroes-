"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@betola/ui/src/components/card';
import { Button } from '@betola/ui/src/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@betola/ui/src/components/avatar';
import { Badge } from '@betola/ui/src/components/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@betola/ui/src/components/dropdown-menu';
import { Separator } from '@betola/ui/src/components/separator';
import { 
  Trophy, 
  Users, 
  Plus, 
  Eye, 
  UserPlus, 
  Calendar, 
  Clock,
  Star,
  TrendingUp,
  Settings,
  LogOut,
  Circle
} from 'lucide-react';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'finished';
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  betoletas: number;
  winRate: number;
}

interface League {
  id: string;
  name: string;
  participants: number;
  prize: number;
  status: 'active' | 'upcoming' | 'finished';
}

const BetolaLandingPage: React.FC = () => {
  const [matches] = useState<Match[]>([
    {
      id: '1',
      homeTeam: 'Flamengo',
      awayTeam: 'Palmeiras',
      date: '2024-01-15',
      time: '16:00',
      status: 'upcoming'
    },
    {
      id: '2',
      homeTeam: 'São Paulo',
      awayTeam: 'Corinthians',
      homeScore: 2,
      awayScore: 1,
      date: '2024-01-14',
      time: '18:30',
      status: 'finished'
    },
    {
      id: '3',
      homeTeam: 'Santos',
      awayTeam: 'Grêmio',
      homeScore: 1,
      awayScore: 1,
      date: '2024-01-14',
      time: '20:00',
      status: 'live'
    },
    {
      id: '4',
      homeTeam: 'Botafogo',
      awayTeam: 'Atlético-MG',
      date: '2024-01-16',
      time: '19:00',
      status: 'upcoming'
    }
  ]);

  const [friends] = useState<Friend[]>([
    {
      id: '1',
      name: 'Carlos Silva',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
      betoletas: 1250,
      winRate: 68
    },
    {
      id: '2',
      name: 'Ana Santos',
      avatar: '/api/placeholder/40/40',
      isOnline: false,
      betoletas: 890,
      winRate: 72
    },
    {
      id: '3',
      name: 'Pedro Costa',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
      betoletas: 2100,
      winRate: 65
    },
    {
      id: '4',
      name: 'Maria Oliveira',
      avatar: '/api/placeholder/40/40',
      isOnline: true,
      betoletas: 1580,
      winRate: 74
    }
  ]);

  const [myLeagues] = useState<League[]>([
    {
      id: '1',
      name: 'Champions League',
      participants: 12,
      prize: 5000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Friends Cup',
      participants: 8,
      prize: 2000,
      status: 'upcoming'
    }
  ]);

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500';
      case 'finished':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'AO VIVO';
      case 'finished':
        return 'FINALIZADO';
      default:
        return 'PRÓXIMO';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Betola</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/api/placeholder/40/40" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Bem-vindo ao <span className="text-primary">Betola</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A plataforma definitiva para apostas esportivas. Crie ligas, desafie amigos e prove que você é o melhor apostador!
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Taxa de vitória: 73%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Betoletas: 1,850</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Campeonato Brasileiro</h2>
            <Badge variant="outline" className="text-sm">
              <Calendar className="mr-1 h-4 w-4" />
              Rodada 15
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={`${getMatchStatusColor(match.status)} text-white text-xs`}
                    >
                      {getMatchStatusText(match.status)}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {match.time}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{match.homeTeam}</span>
                      {match.homeScore !== undefined && (
                        <span className="text-2xl font-bold">{match.homeScore}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">VS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{match.awayTeam}</span>
                      {match.awayScore !== undefined && (
                        <span className="text-2xl font-bold">{match.awayScore}</span>
                      )}
                    </div>
                    <Button className="w-full" size="sm">
                      {match.status === 'upcoming' ? 'Apostar' : 'Ver Detalhes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-foreground mb-8">Suas Ligas</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Criar Liga</h3>
                <p className="text-muted-foreground text-center text-sm">
                  Crie uma nova liga e convide seus amigos
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Eye className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Minhas Ligas</h3>
                <p className="text-muted-foreground text-center text-sm">
                  Veja suas {myLeagues.length} ligas ativas
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Entrar em Liga</h3>
                <p className="text-muted-foreground text-center text-sm">
                  Encontre e participe de novas ligas
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {myLeagues.map((league) => (
              <Card key={league.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <Trophy className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{league.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {league.participants} participantes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {league.prize.toLocaleString()} betoletas
                      </p>
                      <Badge variant={league.status === 'active' ? 'default' : 'secondary'}>
                        {league.status === 'active' ? 'Ativa' : 'Próxima'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Liga
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Seus Amigos</h2>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Adicionar Amigos
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {friends.map((friend) => (
              <Card key={friend.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <Circle 
                        className={`absolute -bottom-1 -right-1 h-4 w-4 ${
                          friend.isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{friend.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Betoletas:</span>
                      <span className="font-semibold text-primary">
                        {friend.betoletas.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de vitória:</span>
                      <span className="font-semibold text-green-600">
                        {friend.winRate}%
                      </span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline" size="sm">
                    Desafiar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-border bg-muted/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Betola</span>
              </div>
              <p className="text-muted-foreground text-sm">
                A melhor plataforma de apostas esportivas do Brasil.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Como funciona</li>
                <li>Preços</li>
                <li>Recursos</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Central de ajuda</li>
                <li>Contato</li>
                <li>Status</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacidade</li>
                <li>Termos</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Betola. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Jogue com responsabilidade. +18
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BetolaLandingPage;
