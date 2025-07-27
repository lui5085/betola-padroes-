'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Trophy, Target, TrendingUp } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface MarketSelection {
  name: string
  value: string
  odds: number
  isActive: boolean
}

interface Market {
  id: string
  type: string
  name: string
  selections: MarketSelection[]
  isActive: boolean
}

interface Match {
  id: string
  homeTeam: {
    id: string
    name: string
    logo?: string
  }
  awayTeam: {
    id: string
    name: string
    logo?: string
  }
  kickoffTime: string
  status: string
  round: number
  markets?: Market[]
}

interface BetSelection {
  matchId: string
  marketId: string
  marketType: string
  marketName: string
  selection: string
  selectionName: string
  odds: number
  match: {
    homeTeam: string
    awayTeam: string
    kickoffTime: string
  }
}

export default function ApostasPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedBets, setSelectedBets] = useState<BetSelection[]>([])
  const [betAmount, setBetAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [userBalance, setUserBalance] = useState(0)

  useEffect(() => {
    loadMatches()
    loadUserWallet()
  }, [])

  const loadMatches = async () => {
    try {
      const response = await apiClient.getAvailableMatches()
      const matchesData: Match[] = Array.isArray(response) ? response : []
      
      // Load markets for each match
      const matchesWithMarkets = await Promise.all(
        matchesData.map(async (match: Match) => {
          try {
            const marketsResponse = await apiClient.getBettingMarkets(match.id)
            return {
              ...match,
              markets: Array.isArray(marketsResponse) ? marketsResponse : []
            }
          } catch (error) {
            console.error(`Failed to load markets for match ${match.id}:`, error)
            return { ...match, markets: [] }
          }
        })
      )
      
      setMatches(matchesWithMarkets)
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserWallet = async () => {
    try {
      const response = await apiClient.getUserWallet()
      setUserBalance((response as any)?.balance || 0)
    } catch (error) {
      console.error('Failed to load wallet:', error)
    }
  }

  const addBetSelection = (
    matchId: string,
    marketId: string,
    marketType: string,
    marketName: string,
    selection: string,
    selectionName: string,
    odds: number,
    match: Match
  ) => {
    // Remove existing selection from same match (single bet per match)
    const filteredBets = selectedBets.filter(bet => bet.matchId !== matchId)
    
    const newSelection: BetSelection = {
      matchId,
      marketId,
      marketType,
      marketName,
      selection,
      selectionName,
      odds,
      match: {
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        kickoffTime: match.kickoffTime
      }
    }
    
    setSelectedBets([...filteredBets, newSelection])
  }

  const removeBetSelection = (matchId: string) => {
    setSelectedBets(selectedBets.filter(bet => bet.matchId !== matchId))
  }

  const calculateTotalOdds = () => {
    return selectedBets.reduce((total, bet) => total * bet.odds, 1)
  }

  const calculatePotentialWin = () => {
    const amount = parseFloat(betAmount) || 0
    return amount * calculateTotalOdds()
  }

  const placeBet = async () => {
    if (!betAmount || selectedBets.length === 0) return

    try {
      const betData = {
        selections: selectedBets.map(bet => ({
          matchId: bet.matchId,
          marketType: bet.marketType,
          selection: bet.selection,
          odds: bet.odds
        })),
        amount: parseFloat(betAmount)
      }

      await apiClient.placeBet(betData)
      
      // Reset form
      setSelectedBets([])
      setBetAmount('')
      
      // Reload wallet
      await loadUserWallet()
      
      alert('Aposta realizada com sucesso!')
    } catch (error) {
      console.error('Failed to place bet:', error)
      alert('Erro ao realizar aposta. Tente novamente.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMarketIcon = (marketType: string) => {
    switch (marketType) {
      case 'MATCH_WINNER':
        return <Trophy className="w-4 h-4" />
      case 'BOTH_TEAMS_SCORE':
        return <Target className="w-4 h-4" />
      case 'OVER_UNDER_GOALS':
        return <TrendingUp className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando partidas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Apostas Esportivas</h1>
        <p className="text-gray-600 mt-2">Brasileirão Série A</p>
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-lg font-semibold text-green-800">
            Saldo: {userBalance.toLocaleString('pt-BR')} Betoletas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Partidas */}
        <div className="lg:col-span-2 space-y-4">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Nenhuma partida disponível para apostas no momento.</p>
              </CardContent>
            </Card>
          ) : (
            matches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{match.homeTeam.name}</span>
                          <span className="text-gray-500">vs</span>
                          <span className="font-semibold">{match.awayTeam.name}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(match.kickoffTime)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Rodada {match.round}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {match.markets && match.markets.length > 0 ? (
                    <div className="space-y-4">
                      {match.markets.map((market) => (
                        <div key={market.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            {getMarketIcon(market.type)}
                            <h4 className="font-medium">{market.name}</h4>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {market.selections.map((selection) => (
                              <Button
                                key={selection.value}
                                variant={
                                  selectedBets.some(bet => 
                                    bet.matchId === match.id && bet.selection === selection.value
                                  ) ? "default" : "outline"
                                }
                                className="h-auto p-3 flex flex-col items-center"
                                disabled={!selection.isActive}
                                onClick={() => addBetSelection(
                                  match.id,
                                  market.id,
                                  market.type,
                                  market.name,
                                  selection.value,
                                  selection.name,
                                  selection.odds,
                                  match
                                )}
                              >
                                <span className="text-sm font-medium">{selection.name}</span>
                                <span className="text-lg font-bold">{selection.odds.toFixed(2)}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Odds não disponíveis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Cupom de Apostas */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Cupom de Apostas</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Selecione suas apostas para começar
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Apostas Selecionadas */}
                  <div className="space-y-3">
                    {selectedBets.map((bet) => (
                      <div key={bet.matchId} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm">
                            <p className="font-medium">{bet.match.homeTeam} vs {bet.match.awayTeam}</p>
                            <p className="text-gray-500">{bet.marketName}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBetSelection(bet.matchId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{bet.selectionName}</span>
                          <span className="font-bold">{bet.odds.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Valor da Aposta */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor da Aposta</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Digite o valor"
                      className="w-full p-2 border rounded-lg"
                      min="1"
                      max={userBalance}
                    />
                  </div>

                  {/* Resumo */}
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Odd Total:</span>
                      <span className="font-semibold">{calculateTotalOdds().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Possível Ganho:</span>
                      <span className="font-semibold text-green-600">
                        {calculatePotentialWin().toLocaleString('pt-BR')} Betoletas
                      </span>
                    </div>
                  </div>

                  {/* Botão de Apostar */}
                  <Button
                    onClick={placeBet}
                    disabled={!betAmount || selectedBets.length === 0 || parseFloat(betAmount) > userBalance}
                    className="w-full"
                  >
                    Confirmar Aposta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}