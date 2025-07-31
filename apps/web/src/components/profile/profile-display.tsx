"use client";

import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { apiClient } from '@/lib/api/client';
import { User, Mail, Calendar, Heart, Edit2, Trophy, Target } from 'lucide-react';
import Link from 'next/link';

const fetcher = () => apiClient.getProfile();

export default function ProfileDisplay() {
  const { data: profile, isLoading, error } = useSWR('profile', fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Erro ao carregar perfil</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profileData = profile?.profile;
  const userData = profile?.user;
  
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src={profileData?.avatarUrl} alt={profileData?.displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {getInitials(profileData?.displayName || userData?.username || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {profileData?.displayName || userData?.username}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {userData?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  @{userData?.username}
                </Badge>
              </div>
            </div>
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="shrink-0">
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Perfil
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Bio
              </label>
              <p className="mt-1 text-foreground">
                {profileData?.bio || (
                  <span className="text-muted-foreground italic">
                    Nenhuma bio adicionada ainda. Conte um pouco sobre você!
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Time Favorito
              </label>
              <p className="mt-1 text-foreground">
                {profileData?.favoriteTeam || (
                  <span className="text-muted-foreground italic">
                    Nenhum time selecionado
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Membro desde
              </label>
              <p className="mt-1 text-foreground">
                {profileData?.createdAt?._value ? 
                  new Date(profileData.createdAt._value).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Data não disponível'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Estatísticas
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Apostas</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-muted-foreground">Vitórias</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-muted-foreground">Pontos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/apostas">
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Fazer Aposta
              </Button>
            </Link>
            <Link href="/minhas-apostas">
              <Button variant="outline" className="w-full justify-start">
                <Trophy className="h-4 w-4 mr-2" />
                Minhas Apostas
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 