'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBrasileraoStandings, BrasileraoStandings } from '@/lib/api/teams';
import { Trophy } from 'lucide-react';

export function StandingsTable() {
  const router = useRouter();
  const [standings, setStandings] = useState<BrasileraoStandings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  useEffect(() => {
    loadStandings();
  }, []);

  const loadStandings = async () => {
    try {
      setLoading(true);
      const data = await getBrasileraoStandings();
      setStandings(data);
    } catch (err: any) {
      console.error('Error loading standings:', err);
      setError(err.message || 'Erro ao carregar tabela');
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position: number) => {
    if (position <= 4) return 'bg-green-500';
    if (position <= 6) return 'bg-blue-500';
    if (position >= 17) return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getPositionTooltip = (position: number) => {
    if (position <= 4) return 'Libertadores';
    if (position <= 6) return 'Sul-Americana';
    if (position >= 17) return 'Rebaixamento';
    return '';
  };


  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Classificação do Brasileirão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Classificação do Brasileirão
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadStandings}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!standings) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Classificação do Brasileirão 2025
        </CardTitle>
        <p className="text-sm text-gray-600">
          Rodada {standings.season.currentMatchday}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PG</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">J</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">V</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">E</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SG</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.standings.slice(0, showFullTable ? standings.standings.length : 10).map((team) => (
                <tr key={team.team.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-1 h-8 rounded ${getPositionColor(team.position)}`}
                        title={getPositionTooltip(team.position)}
                      ></div>
                      <span className="font-medium text-gray-900">{team.position}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => router.push(`/teams/${team.team.id}`)}
                    >
                      <img 
                        src={team.team.crest} 
                        alt={team.team.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {team.team.shortName || team.team.name}
                        </div>
                        <div className="text-xs text-gray-500 hidden sm:block">
                          {team.team.tla}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className="font-bold">
                      {team.points}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">
                    {team.playedGames}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-green-600">
                    {team.won}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-yellow-600">
                    {team.draw}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-red-600">
                    {team.lost}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {standings.standings.length > 10 && (
          <div className="px-4 py-3 bg-gray-50 text-center">
            <button 
              onClick={() => setShowFullTable(!showFullTable)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showFullTable ? 'Ver menos' : `Ver tabela completa (${standings.standings.length} times)`}
            </button>
          </div>
        )}
        
        <div className="px-4 py-3 bg-gray-50 border-t">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded"></div>
              <span>Libertadores</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span>Sul-Americana</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded"></div>
              <span>Rebaixamento</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}