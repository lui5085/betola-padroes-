'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTeamDetails, TeamDetails } from '@/lib/api/teams';
import { ArrowLeft, MapPin, Calendar, Globe, Users, User, Trophy } from 'lucide-react';

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = parseInt(params.id as string);

  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teamId) {
      loadTeamDetails();
    }
  }, [teamId]);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const data = await getTeamDetails(teamId);
      setTeam(data);
    } catch (err: any) {
      console.error('Error loading team details:', err);
      setError(err.message || 'Erro ao carregar detalhes do time');
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position: string) => {
    const normalizedPosition = position.toLowerCase().trim();
    
    if (normalizedPosition.includes('goalkeeper')) return 'bg-yellow-500';
    
    if (normalizedPosition.includes('back') || 
        normalizedPosition.includes('defence') ||
        normalizedPosition.includes('defender')) return 'bg-blue-500';
    
    if (normalizedPosition.includes('midfield') || 
        normalizedPosition.includes('midfielder')) return 'bg-green-500';
    
    if (normalizedPosition.includes('forward') || 
        normalizedPosition.includes('striker') ||
        normalizedPosition.includes('winger') ||
        normalizedPosition.includes('offence')) return 'bg-red-500';
    
    return 'bg-gray-500';
  };

  const cleanAddress = (address: string) => {
    if (!address) return '';
    
    let cleaned = address
      .replace(/\bnull\b/gi, '')
      .replace(/\bundefined\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    cleaned = cleaned.replace(/^,+|,+$/g, '').trim();
    
    cleaned = cleaned.replace(/,+/g, ',');
    
    return cleaned || 'Endereço não disponível';
  };

  const getPositionText = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'goalkeeper': 'Goleiro',
      'defence': 'Defesa',
      'midfield': 'Meio-campo',
      'offence': 'Ataque',
      
      'left-back': 'Lateral Esquerdo',
      'right-back': 'Lateral Direito',
      'centre-back': 'Zagueiro',
      'central defender': 'Zagueiro',
      'defensive midfield': 'Volante',
      'central midfield': 'Meio-campo',
      'attacking midfield': 'Meia Atacante',
      'left midfield': 'Meio-campo Esquerdo',
      'right midfield': 'Meio-campo Direito',
      'left winger': 'Ponta Esquerda',
      'right winger': 'Ponta Direita',
      'centre-forward': 'Centroavante',
      'striker': 'Atacante',
      'forward': 'Atacante',
    };
    
    const normalizedPosition = position.toLowerCase().trim();
    return positionMap[normalizedPosition] || position;
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar time</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => router.push('/matches')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Partidas
        </Button>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Time não encontrado</h1>
        <Button onClick={() => router.push('/matches')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Partidas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/matches')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Partidas
          </Button>

          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <img 
                src={team.crest} 
                alt={team.name}
                className="w-24 h-24 object-contain bg-white rounded-lg shadow-lg p-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-700 bg-clip-text text-transparent mb-2">
                {team.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {team.tla}
                </Badge>
                {team.founded && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Fundado em {team.founded}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {team.address && cleanAddress(team.address) !== 'Endereço não disponível' && (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">ENDEREÇO</div>
                    <div className="text-lg font-semibold text-gray-800">{cleanAddress(team.address)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {team.venue && (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">ESTÁDIO</div>
                    <div className="text-lg font-semibold text-gray-800">{team.venue}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {team.website && (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium">WEBSITE</div>
                    <a 
                      href={team.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Site Oficial
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {team.coach && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6" />
                Técnico
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{team.coach.name}</h3>
                  <p className="text-gray-600">{team.coach.nationality}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {team.squad.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                Elenco ({team.squad.length} jogadores)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {team.squad.map((player) => (
                  <div 
                    key={player.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <Badge 
                        className={`${getPositionColor(player.position)} text-white text-xs`}
                      >
                        {getPositionText(player.position)}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{player.name}</div>
                      <div className="text-sm text-gray-500">{player.nationality}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}