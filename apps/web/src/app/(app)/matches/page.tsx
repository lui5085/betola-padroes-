'use client'

import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import { MatchCard } from '@/components/matches/match-card';
import { BetSlip } from '@/components/bets/bet-slip';
import { StandingsTable } from '@/components/matches/standings-table';

async function fetcher(url: string) {
  const data = await apiClient.get<any[]>(url);
  return data;
}

export default function MatchesPage() {
  const { data, error, isLoading } = useSWR('/matches', fetcher);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro ao Carregar</h2>
          <p className="text-gray-600">Falha ao carregar as partidas. Tente novamente.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando partidas...</p>
        </div>
      </div>
    );
  }

  const matches = data || [];

  return (
    <div className="container mx-auto p-4 pb-96 lg:pb-4">
      <div className="flex gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Partidas da Rodada</h1>
          
          <StandingsTable />
          
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhuma partida disponível no momento.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Recarregar
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {matches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>

        <div className="w-96 hidden lg:block">
          <BetSlip />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <BetSlip />
        </div>
      </div>
    </div>
  );
}