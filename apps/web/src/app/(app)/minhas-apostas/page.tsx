// apps/web/src/app/(app)/minhas-apostas/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, Trophy, TrendingUp, CheckCircle, XCircle, Clock3 } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BetSelection {
  matchId: string
  marketType: string
  selection: string
  odds: number
  homeTeam?: string
  awayTeam?: string
  kickoffTime?: string
  matchStatus?: string
  homeScore?: number
  awayScore?: number
}

interface Bet {
  id: string
  selections: BetSelection[]
  amount: number
  totalOdds: number
  potentialReturn: number
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED'
  createdAt: string
  settledAt?: string
}

interface WalletData {
  balance: number
  totalWon: number
  totalLost: number
  netProfit: number
}

export default function MinhasApostasPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'WON' | 'LOST'>('all')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      await Promise.all([
        loadUserBets(),
        loadWallet(),
        loadStats()
      ])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserBets = async () => {
    try {
      const response = await apiClient.getUserBets()
      setBets(response || [])
    } catch (error) {
      console.error('Failed to load user bets:', error)
    }
  }

  const loadWallet = async () => {
    try {
      const response = await apiClient.getUserWallet()
      setWallet(response)
    } catch (error) {
      console.error('Failed to load wallet:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiClient.getUserStats()
      setStats(response)
    } catch (error) {
      console.error('Failed to load stats:', error)
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

  const getMarketName = (marketType: string) => {
    const types: Record<string, string> = {
      'MATCH_WINNER': 'Resultado Final',
      'BOTH_TEAMS_SCORE': 'Ambas Marcam',
      'OVER_UNDER_GOALS': 'Total de Gols',
      'DOUBLE_CHANCE': 'Dupla Chance',
      'CORRECT_SCORE': 'Placar Correto',
      'FIRST_HALF_RESULT': 'Resultado 1º Tempo',
      'ODD_EVEN_GOALS': 'Par/Ímpar',
      'ASIAN_HANDICAP': 'Handicap Asiático'
    }
    return types[marketType] || marketType
  }

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true
    return bet.status === filter
  })

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {wallet?.balance.toFixed(0) || '0'}
              </p>
              <p className="text-sm text-gray-600">Saldo Atual</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.totalBets || 0}</p>
              <p className="text-sm text-gray-600">Total de Apostas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats?.wonBets || 0}</p>
              <p className="text-sm text-gray-600">Apostas Ganhas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats?.roi?.toFixed(1) || 0}%</p>
              <p className="text-sm text-gray-600">ROI</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Todas ({bets.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg ${filter === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Pendentes ({bets.filter(b => b.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('WON')}
          className={`px-4 py-2 rounded-lg ${filter === 'WON' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Ganhas ({bets.filter(b => b.status === 'WON').length})
        </button>
        <button
          onClick={() => setFilter('LOST')}
          className={`px-4 py-2 rounded-lg ${filter === 'LOST' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Perdidas ({bets.filter(b => b.status === 'LOST').length})
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
                      <p className="font-semibold">Aposta #{typeof bet.id === 'string' ? bet.id.slice(0, 8) : bet.id}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(bet.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                          <div className="font-medium">
                            {selection.homeTeam && selection.awayTeam 
                              ? `${selection.homeTeam} vs ${selection.awayTeam}`
                              : `Partida ${typeof selection.matchId === 'string' ? selection.matchId.slice(0, 8) : selection.matchId}`}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {getMarketName(selection.marketType)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{selection.odds.toFixed(2)}</Badge>
                          {selection.homeScore !== undefined && selection.awayScore !== undefined && (
                            <p className="text-sm text-gray-600 mt-1">
                              {selection.homeScore} x {selection.awayScore}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-600">
                          {selection.selection}
                        </span>
                        {selection.kickoffTime && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(selection.kickoffTime), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="mb-4" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Valor Apostado</p>
                    <p className="font-semibold">{bet.amount.toFixed(0)} Betoletas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Possível Ganho</p>
                    <p className="font-semibold text-green-600">
                      {bet.potentialReturn.toFixed(0)} Betoletas
                    </p>
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
                      {bet.status === 'WON' ? `+${bet.potentialReturn.toFixed(0)}` :
                       bet.status === 'LOST' ? `-${bet.amount.toFixed(0)}` :
                       'Pendente'}
                    </p>
                  </div>
                </div>

                {bet.settledAt && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      Liquidada em {format(new Date(bet.settledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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