'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBetSlipStore } from '@/stores/bet-slip-store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Users } from 'lucide-react';
import { useState } from 'react';

interface ApiMatch {
  id: string;
  kickoffTime: string;
  homeTeam: { 
    name: string;
    shortName?: string;
    logoUrl?: string;
  };
  awayTeam: { 
    name: string;
    shortName?: string;
    logoUrl?: string;
  };
  markets: {
    id: string;
    type: string;
    name: string;
    options: string;
  }[];
}

interface MatchCardProps {
  match: ApiMatch;
}

export function MatchCard({ match }: MatchCardProps) {
  const { addSelection, selections } = useBetSlipStore();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelectOdd = (market: any, option: any) => {
    console.log('Selecting odd:', { market, option });
    
    try {
      addSelection({
        matchId: match.id,
        matchName: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
        marketType: market.type,
        marketName: market.name,
        selection: option.name,
        odds: option.odds,
      });

      setFeedback(`${option.name} adicionado!`);
      setTimeout(() => setFeedback(null), 2000);
    } catch (error) {
      console.error('Error adding selection:', error);
      setFeedback('Erro ao adicionar seleção');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const isOptionSelected = (marketType: string, optionName: string) => {
    return selections.some(s => 
      s.matchId === match.id && 
      s.marketType === marketType && 
      s.selection === optionName
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">
              {match.homeTeam.shortName || match.homeTeam.name} vs {match.awayTeam.shortName || match.awayTeam.name}
            </CardTitle>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {format(new Date(match.kickoffTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
        {feedback && (
          <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            {feedback}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!match.markets || match.markets.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Mercados não disponíveis</p>
          </div>
        ) : (
          match.markets.map((market) => {
            let options;
            try {
              options = JSON.parse(market.options);
            } catch (e) {
              console.error('Error parsing market options:', e);
              return null;
            }

            return (
              <div key={market.id} className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700">{market.name}</h4>
                  <Separator className="mt-1" />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {options.map((option: any) => {
                    const isSelected = isOptionSelected(market.type, option.name);
                    return (
                      <Button
                        key={option.name}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-auto p-2 flex flex-col gap-1 ${
                          isSelected 
                            ? "bg-blue-600 hover:bg-blue-700" 
                            : "hover:bg-blue-50"
                        }`}
                        onClick={() => handleSelectOdd(market, option)}
                      >
                        <span className="text-xs font-medium truncate w-full">
                          {option.name}
                        </span>
                        <Badge 
                          variant={isSelected ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {option.odds?.toFixed(2) || 'N/A'}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
} 