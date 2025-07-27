'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, Trophy } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { useBetSlipStore } from '@/stores/bet-slip-store'
import { BetSlip } from '@/components/bets/bet-slip'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Match {
  id: string
  homeTeam: {
    id: string
    name: string
    shortName: string
    logoUrl?: string
  }
  awayTeam: {
    id: string
    name: string
    shortName: string
    logoUrl?: string
  }
  kickoffTime: string
  status: string
  homeScore?: number
  awayScore?: number
  round: number
  season: string
}

interface Market {
  id: string
  type: string
  name: string
  options: Array<{
    name: string
    odds: number
  }>
  isActive: boolean
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [markets, setMarkets] = useState<Record<string, Market[]>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMarkets, setLoadingMarkets] = useState<string | null>(null)
  
  const { addSelection } = useBetSlipStore()

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const data = await apiClient.getMatches({ limit: 20 })
      setMatches(data as Match[])
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMarkets = async (matchId: string) => {
    if (markets[matchId]) {
      setSelectedMatch(selectedMatch === matchId ? null : matchId)
      return
    }

    setLoadingMarkets(matchId)
    try {
      const data = await apiClient.getMatchMarkets(matchId)
      setMarkets(prev => ({ ...prev, [matchId]: data as Market[] }))
      setSelectedMatch(matchId)
    } catch (error) {
      console.error('Failed to fetch markets:', error)
    } finally {
      setLoadingMarkets(null)
    }
  }

  const handleSelectOdd = (match: Match, market: Market, option: any) => {
    addSelection({
      matchId: match.id,
      matchName: `${match.homeTeam.name} x ${match.awayTeam.name}`,
      marketType: market.type,
      marketName: market.name,
      selection: option.name,
      odds: option.odds
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold mb-6">Partidas Disponíveis</h1>
          
          {matches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma partida disponível no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            matches.map(match => (
              <Card key={match.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />
                      <span>Brasileirão {match.season} - Rodada {match.round}</span>
                    </div>
                    <Badge variant={match.status === 'SCHEDULED' ? 'default' : 'secondary'}>
                      {match.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-center">
                        <h3 className="font-semibold text-lg">{match.homeTeam.name}</h3>
                        <p className="text-sm text-muted-foreground">{match.homeTeam.shortName}</p>
                      </div>
                      
                      <div className="px-4">
                        <div className="text-center">
                          {match.status === 'FINISHED' ? (
                            <div className="text-2xl font-bold">
                              {match.homeScore} - {match.awayScore}
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(match.kickoffTime), 'dd/MM', { locale: ptBR })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(match.kickoffTime), 'HH:mm')}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center">
                        <h3 className="font-semibold text-lg">{match.awayTeam.name}</h3>
                        <p className="text-sm text-muted-foreground">{match.awayTeam.shortName}</p>
                      </div>
                    </div>
                    
                    {match.status === 'SCHEDULED' && (
                      <>
                        <Separator />
                        <div className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchMarkets(match.id)}
                            disabled={loadingMarkets === match.id}
                          >
                            {loadingMarkets === match.id ? (
                              'Carregando...'
                            ) : selectedMatch === match.id ? (
                              'Ocultar Mercados'
                            ) : (
                              'Ver Mercados de Apostas'
                            )}
                          </Button>
                        </div>
                        
                        {selectedMatch === match.id && markets[match.id] && (
                          <div className="space-y-3 pt-2">
                            {markets[match.id].map(market => (
                              <div key={market.id} className="space-y-2">
                                <h4 className="font-medium text-sm">{market.name}</h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {market.options.map((option, idx) => (
                                    <Button
                                      key={idx}
                                      variant="outline"
                                      size="sm"
                                      className="relative"
                                      onClick={() => handleSelectOdd(match, market, option)}
                                    >
                                      <span className="text-xs">{option.name}</span>
                                      <Badge 
                                        variant="secondary" 
                                        className="ml-2 text-xs"
                                      >
                                        {option.odds.toFixed(2)}
                                      </Badge>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="lg:sticky lg:top-4 h-fit">
          <BetSlip />
        </div>
      </div>
    </div>
  )
}