'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { getLeagueDetails, getLeagueRanking, leaveLeague } from '@/lib/api/leagues';
import { ArrowLeft, Users, Trophy, Crown, Shield, Calendar, Settings, LogOut, Code } from 'lucide-react';
import { LeagueChat } from '@/components/chat/league-chat';
import { LeagueSettings } from '@/components/leagues/league-settings';

interface LeagueDetails {
  id: string;
  name: string;
  description: string;
  code: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isOwner?: boolean;
  userRole?: string;
  createdAt: string | Date;
}

interface Member {
  position: number;
  userId: string;
  username: string;
  totalPoints: number;
  wonBets: number;
  lostBets: number;
  totalBets: number;
  winRate: number;
  isCurrentUser?: boolean;
}

export default function LeagueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  const [league, setLeague] = useState<LeagueDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (leagueId) {
      loadLeagueData();
    }
  }, [leagueId]);

  const loadLeagueData = async () => {
    try {
      const [leagueData, rankingData] = await Promise.all([
        getLeagueDetails(leagueId),
        getLeagueRanking(leagueId)
      ]);

      setLeague(leagueData);
      setMembers(rankingData.ranking || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados da liga:', error.message);
      alert(`Erro ao carregar liga: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLeague = async () => {
    if (!league) return;

    try {
      await leaveLeague(league.id);
      alert('Você saiu da liga com sucesso!');
      router.push('/leagues');
    } catch (error: any) {
      alert(`Erro ao sair da liga: ${error.message}`);
    }
  };

  const getRoleIcon = (role?: string, isOwner?: boolean) => {
    if (isOwner) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (role === 'ADMIN') return <Shield className="h-4 w-4 text-blue-500" />;
    return <Users className="h-4 w-4 text-gray-500" />;
  };

  const getRoleText = (role?: string, isOwner?: boolean) => {
    if (isOwner) return 'Dono';
    if (role === 'ADMIN') return 'Admin';
    return 'Membro';
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500">🥇 {position}º</Badge>;
    if (position === 2) return <Badge className="bg-gray-400">🥈 {position}º</Badge>;
    if (position === 3) return <Badge className="bg-amber-600">🥉 {position}º</Badge>;
    return <Badge variant="outline">{position}º</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Liga não encontrada</h1>
        <Button onClick={() => router.push('/leagues')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Ligas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/leagues')}
              className="hover:bg-green-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {league.name}
                </h1>
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                  {getRoleIcon(league.userRole, league.isOwner)}
                  <span className="text-sm font-semibold text-gray-700">
                    {getRoleText(league.userRole, league.isOwner)}
                  </span>
                </div>
              </div>
              {league.description && (
                <p className="text-gray-600 text-lg">{league.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
                  <Code className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono text-gray-800">{league.code}</div>
                  <div className="text-sm text-gray-600 font-medium">CÓDIGO DA LIGA</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    {league.memberCount}/{league.maxMembers}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">MEMBROS</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-green-700 rounded-xl text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <Badge 
                    variant={league.isPrivate ? "secondary" : "default"}
                    className="text-lg px-4 py-2"
                  >
                    {league.isPrivate ? 'Privada' : 'Pública'}
                  </Badge>
                  <div className="text-sm text-gray-600 font-medium mt-2">TIPO DA LIGA</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 mb-8 justify-center">
          {league.isOwner && (
            <Button 
              variant="outline" 
              className="bg-white/70 backdrop-blur-sm border-2 hover:bg-white hover:shadow-lg transition-all duration-200"
              onClick={() => setSettingsModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          )}
          
          {!league.isOwner && (
            <Button 
              variant="outline"
              className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setLeaveModalOpen(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Liga
            </Button>
          )}
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <Trophy className="h-6 w-6" />
              </div>
              Ranking da Liga
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {members.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                  <Trophy className="relative mx-auto h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Ranking em breve!</h3>
                <p className="text-gray-500">Quando os membros começarem a apostar, o ranking aparecerá aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member, index) => (
                  <div
                    key={member.userId}
                    className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                      member.isCurrentUser 
                        ? 'bg-gradient-to-r from-green-100 to-yellow-100 border-2 border-green-300 shadow-lg' 
                        : 'bg-white hover:shadow-lg border border-gray-200'
                    }`}
                  >
                    {member.isCurrentUser && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                        VOCÊ
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          {getPositionBadge(member.position)}
                          {member.position <= 3 && (
                            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full blur animate-pulse"></div>
                          )}
                        </div>
                        
                        <div>
                          <div className="font-bold text-xl text-gray-800 mb-1">
                            {member.username}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {member.totalBets} apostas
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {member.winRate.toFixed(1)}% acertos
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold font-mono text-gray-800 mb-1">
                          {member.totalPoints.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {member.wonBets}W
                          </Badge>
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            {member.lostBets}L
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Sair da Liga"
      >
        <div className="space-y-4">
          <p>Tem certeza que deseja sair da liga "{league.name}"?</p>
          <p className="text-sm text-gray-600">
            Você perderá seu histórico e posição no ranking desta liga.
          </p>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
              onClick={handleLeaveLeague}
            >
              Sim, Sair da Liga
            </Button>
            <Button
              variant="outline"
              onClick={() => setLeaveModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {league && (
        <LeagueSettings
          league={league}
          onLeagueUpdated={setLeague}
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
        />
      )}

      <LeagueChat leagueId={leagueId} />
    </div>
  );
}