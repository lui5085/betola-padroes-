// apps/web/src/components/bets/bet-slip.tsx

'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useBetSlipStore } from '@/stores/bet-slip-store'
import { apiClient } from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export function BetSlip() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { 
    selections, 
    amount, 
    setAmount, 
    removeSelection, 
    clearSelections,
    totalOdds,
    potentialWin
  } = useBetSlipStore()
  
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handlePlaceBet = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (selections.length === 0) {
      setError('Adicione pelo menos uma seleção')
      return
    }

    if (amount < 10) {
      setError('Valor mínimo da aposta é 10 betoletas')
      return
    }

    setIsPlacing(true)
    setError('')

    try {
      await apiClient.placeBet({
        selections: selections.map(s => ({
          matchId: s.matchId,
          marketType: s.marketType,
          selection: s.selection,
          odds: s.odds
        })),
        amount
      })

      setSuccess(true)
      clearSelections()
      
      // Redireciona para minhas apostas após 2 segundos
      setTimeout(() => {
        router.push('/profile?tab=bets')
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer aposta')
    } finally {
      setIsPlacing(false)
    }
  }

  if (selections.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Nenhuma seleção</p>
          <p className="text-xs mt-1">Escolha um mercado para apostar</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Boletim de Aposta</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSelections}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {selections.map((selection) => (
          <div key={`${selection.matchId}-${selection.marketType}`} className="space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{selection.matchName}</p>
                <p className="text-xs text-muted-foreground">{selection.marketName}</p>
                <p className="text-sm">{selection.selection}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selection.odds.toFixed(2)}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSelection(selection.matchId, selection.marketType)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Valor da Aposta</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm">B$</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={10}
              max={10000}
              step={10}
              className="text-right"
            />
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Odds Total:</span>
            <span className="font-medium">{totalOdds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ganho Potencial:</span>
            <span className="font-semibold text-green-600">
              B$ {potentialWin.toFixed(2)}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 text-sm p-2 rounded">
            Aposta realizada com sucesso! Redirecionando...
          </div>
        )}

        <Button
          onClick={handlePlaceBet}
          disabled={isPlacing || success}
          className="w-full"
        >
          {isPlacing ? 'Processando...' : 'Fazer Aposta'}
        </Button>
      </div>
    </Card>
  )
}