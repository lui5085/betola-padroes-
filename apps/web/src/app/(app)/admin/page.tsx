'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Trophy,
  AlertTriangle,
  CheckCircle,
  X,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

interface AdminStats {
  bets: {
    total: number;
    pending: number;
    settled: number;
  };
  users: { total: number };
  matches: { total: number };
  leagues: { total: number };
}

interface PendingBet {
  id: string;
  amount: number;
  totalOdds: number;
  potentialReturn: number;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  selections: Array<{
    selection: string;
    optionName: string;
    odds: number;
    match: {
      homeTeam: string;
      awayTeam: string;
      startTime: string;
      status: string;
    };
    market: {
      type: string;
      name: string;
    };
  }>;
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingBets, setPendingBets] = useState<PendingBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settlingBets, setSettlingBets] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchAdminData();
  }, [isAuthenticated, router]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching admin data...');
      console.log('User:', user);
      console.log('Is authenticated:', isAuthenticated);
      
      const [statsData, betsData] = await Promise.all([
        apiClient.get<AdminStats>('/admin/stats'),
        apiClient.get<{ bets: PendingBet[] }>('/admin/bets/pending?limit=10'),
      ]);
      
      console.log('Admin data fetched successfully:', { statsData, betsData });
      setStats(statsData);
      setPendingBets(betsData.bets);
    } catch (error: any) {
      console.error('Failed to fetch admin data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });
      
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        setError('Acesso negado. Você precisa ser administrador para acessar esta página.');
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        setError('Não autenticado. Faça login novamente.');
      } else {
        setError(`Erro ao carregar dados administrativos: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const settleBet = async (betId: string, status: 'WON' | 'LOST') => {
    try {
      setSettlingBets(prev => new Set(Array.from(prev).concat([betId])));
      
      await apiClient.post(`/admin/bets/${betId}/settle`, {
        status,
        reason: `Liquidação manual pelo admin ${user?.username}`,
      });
      
      setPendingBets(prev => prev.filter(bet => bet.id !== betId));
      
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          bets: {
            ...prev.bets,
            pending: prev.bets.pending - 1,
            settled: prev.bets.settled + 1,
          }
        } : null);
      }
    } catch (error) {
      console.error('Failed to settle bet:', error);
      alert('Erro ao liquidar aposta');
    } finally {
      setSettlingBets(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(betId);
        return newSet;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pt-BR')} betoletas`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="outline" className="text-blue-600">Agendado</Badge>;
      case 'LIVE':
        return <Badge className="bg-green-500">Ao Vivo</Badge>;
      case 'FINISHED':
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando painel administrativo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Painel Administrativo
        </h1>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Apostas Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.bets.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                de {stats.bets.total} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.users.total}
              </div>
              <p className="text-xs text-muted-foreground">
                usuários registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.matches.total}
              </div>
              <p className="text-xs text-muted-foreground">
                partidas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ligas</CardTitle>
              <Trophy className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.leagues.total}
              </div>
              <p className="text-xs text-muted-foreground">
                ligas ativas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Apostas Pendentes ({pendingBets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingBets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Todas as apostas foram liquidadas!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBets.map((bet) => (
                <div key={bet.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {bet.user.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(bet.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(bet.amount)}
                      </p>
                      <p className="text-sm text-green-600">
                        Retorno: {formatCurrency(bet.potentialReturn)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Odds: {bet.totalOdds.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {bet.selections.map((selection, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {selection.match.homeTeam} vs {selection.match.awayTeam}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selection.market.name}: {selection.optionName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(selection.match.startTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {selection.odds.toFixed(2)}
                            </p>
                            {getStatusBadge(selection.match.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => settleBet(bet.id, 'WON')}
                      disabled={settlingBets.has(bet.id)}
                    >
                      {settlingBets.has(bet.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como Ganha
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => settleBet(bet.id, 'LOST')}
                      disabled={settlingBets.has(bet.id)}
                    >
                      {settlingBets.has(bet.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Marcar como Perdida
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}