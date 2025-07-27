'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Trophy, TrendingUp, CheckCircle, XCircle, Clock3 } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface BetSelection {
  matchId: string
  marketType: string
  selection: string
  odds: number
  match: {
    homeTeam: string
    awayTeam: string
    kickoffTime: string
    homeScore?: number
    awayScore?: number
    status: string
  }
}

interface Bet {
  id: string
  selections: BetSelection[]
  amount: number
  totalOdds: number
  potentialWin: number
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED'
  createdAt: string
  settledAt?: string
}

interface WalletData {
  balance: number
  totalWon: number
  totalLost: number
}

export default function MinhasApostasPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all')

  useEffect(() => {
    loadUserBets()
    loadWallet()
  }, [])

  const loadUserBets = async () => {
    try {
      const response = await apiClient.getUserBets()
      setBets((response as any)?.bets || [])
    } catch (error) {
      console.error('Failed to load user bets:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWallet = async () => {
    try {
      const response = await apiClient.getUserWallet()
      setWallet(response as WalletData)
    } catch (error) {
      console.error('Failed to load wallet:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><Clock3 className="w-3 h-3 mr-1" />Pendente</Badge>
      case 'WON':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Ganha</Badge>
      case 'LOST':
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" />Perdida</Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMarketIcon = (marketType: string) => {
    switch (marketType) {
      case 'MATCH_WINNER':
        return <Trophy className="w-4 h-4" />
      case 'BOTH_TEAMS_SCORE':
        return <TrendingUp className="w-4 h-4" />
      default:
        return null
    }
  }

  const getMarketName = (marketType: string) => {
    switch (marketType) {
      case 'MATCH_WINNER':
        return 'Resultado Final'
      case 'BOTH_TEAMS_SCORE':
        return 'Ambas Marcam'
      case 'OVER_UNDER_GOALS':
        return 'Total de Gols'
      default:
        return marketType
    }
  }

  const getSelectionName = (marketType: string, selection: string) => {
    if (marketType === 'MATCH_WINNER') {
      switch (selection) {
        case 'Home': return 'Casa'
        case 'Draw': return 'Empate'
        case 'Away': return 'Visitante'
        default: return selection
      }
    }
    if (marketType === 'BOTH_TEAMS_SCORE') {
      switch (selection) {
        case 'Yes': return 'Sim'
        case 'No': return 'Não'
        default: return selection
      }
    }
    return selection
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatMatchResult = (selection: BetSelection) => {
    const { match } = selection
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      return `${match.homeScore} x ${match.awayScore}`
    }
    return ''
  }

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true
    return bet.status.toLowerCase() === filter
  })

  const stats = {
    total: bets.length,
    pending: bets.filter(bet => bet.status === 'PENDING').length,
    won: bets.filter(bet => bet.status === 'WON').length,
    lost: bets.filter(bet => bet.status === 'LOST').length,
    winRate: bets.length > 0 ? (bets.filter(bet => bet.status === 'WON').length / bets.filter(bet => bet.status !== 'PENDING').length * 100) || 0 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando suas apostas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Apostas</h1>
        <p className="text-gray-600 mt-2">Histórico e acompanhamento das suas apostas</p>
      </div>

      {/* Estatísticas e Carteira */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{wallet?.balance.toLocaleString('pt-BR') || '0'}</p>
              <p className="text-sm text-gray-600">Saldo Atual</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total de Apostas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.won}</p>
              <p className="text-sm text-gray-600">Apostas Ganhas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Taxa de Acerto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Todas ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Pendentes ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('won')}
          className={`px-4 py-2 rounded-lg ${filter === 'won' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Ganhas ({stats.won})
        </button>
        <button
          onClick={() => setFilter('lost')}
          className={`px-4 py-2 rounded-lg ${filter === 'lost' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Perdidas ({stats.lost})
        </button>
      </div>

      {/* Lista de Apostas */}
      <div className="space-y-4">
        {filteredBets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhuma aposta encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBets.map((bet) => (
            <Card key={bet.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold">Aposta #{bet.id.slice(0, 8)}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(bet.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(bet.status)}
                    <div className="mt-1">
                      <span className="text-sm text-gray-500">Odd: </span>
                      <span className="font-semibold">{bet.totalOdds.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Seleções */}
                <div className="space-y-3 mb-4">
                  {bet.selections.map((selection, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            {getMarketIcon(selection.marketType)}
                            <span className="font-medium">{selection.match.homeTeam} vs {selection.match.awayTeam}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{getMarketName(selection.marketType)}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{selection.odds.toFixed(2)}</Badge>
                          {formatMatchResult(selection) && (
                            <p className="text-sm text-gray-600 mt-1">{formatMatchResult(selection)}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-600">
                          {getSelectionName(selection.marketType, selection.selection)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(selection.match.kickoffTime)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="mb-4" />

                {/* Resumo Financeiro */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Valor Apostado</p>
                    <p className="font-semibold">{bet.amount.toLocaleString('pt-BR')} Betoletas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Possível Ganho</p>
                    <p className="font-semibold text-green-600">{bet.potentialWin.toLocaleString('pt-BR')} Betoletas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {bet.status === 'WON' ? 'Ganho Real' : bet.status === 'LOST' ? 'Perda' : 'Status'}
                    </p>
                    <p className={`font-semibold ${
                      bet.status === 'WON' ? 'text-green-600' : 
                      bet.status === 'LOST' ? 'text-red-600' : 
                      'text-blue-600'
                    }`}>
                      {bet.status === 'WON' ? `+${bet.potentialWin.toLocaleString('pt-BR')}` :
                       bet.status === 'LOST' ? `-${bet.amount.toLocaleString('pt-BR')}` :
                       'Pendente'}
                    </p>
                  </div>
                </div>

                {bet.settledAt && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      Liquidada em {formatDate(bet.settledAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}