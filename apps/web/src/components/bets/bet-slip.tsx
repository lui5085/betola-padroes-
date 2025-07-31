// apps/web/src/components/bets/bet-slip.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trash2, AlertCircle } from 'lucide-react'
import { useBetSlipStore } from '@/stores/bet-slip-store'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/stores/auth-store'

export function BetSlip() {
  const router = useRouter()
  const { selections, amount, setAmount, removeSelection, clearSelections } = useBetSlipStore();
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1)
  const potentialWin = parseFloat(amount) * totalOdds || 0

  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (selections.length === 0) {
      setError('Adicione pelo menos uma seleção')
      return
    }

    const betAmount = parseFloat(amount)
    if (isNaN(betAmount) || betAmount < 10) {
      setError('O valor mínimo da aposta é 10 betoletas')
      return
    }

    if (betAmount > 10000) {
      setError('O valor máximo da aposta é 10.000 betoletas')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const requestData = {
        amount: parseFloat(amount),
        selections: selections.map(s => ({
          matchId: s.matchId,
          marketType: s.marketType,
          selection: s.selection,
          odds: s.odds,
        })),
      };
      await apiClient.placeBet(requestData);
      
      setSuccess('Aposta realizada com sucesso!');
      clearSelections();
      setTimeout(() => {
        setSuccess(null);
        router.push('/minhas-apostas');
      }, 2000);
    } catch (err: any) {
      console.error('Error placing bet:', err)
      setError(err.response?.data?.message || err.message || 'Erro ao fazer aposta')
    } finally {
      setLoading(false)
    }
  }

  if (selections.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selections.length}
            </Badge>
            Cupom de Apostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-muted-foreground font-medium">
              Nenhuma aposta selecionada
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique nas odds das partidas para adicionar ao cupom
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selections.length}
            </Badge>
            Cupom de Apostas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelections}
            disabled={loading}
          >
            Limpar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {selections.map((sel, idx) => (
            <div key={idx} className="bg-secondary/20 rounded p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{sel.matchName}</p>
                  <p className="text-xs text-muted-foreground">{sel.marketName}</p>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {sel.selection}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{sel.odds.toFixed(2)}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeSelection(sel.matchId, sel.marketType)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Valor da Aposta (Betoletas)
          </label>
          <Input
            id="amount"
            type="number"
            min="10"
            max="10000"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo: 10 | Máximo: 10.000
          </p>
        </div>

        <div className="space-y-2 bg-secondary/20 rounded p-3">
          <div className="flex justify-between text-sm">
            <span>Odd Total:</span>
            <span className="font-medium">{totalOdds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Possível Ganho:</span>
            <span className="font-medium text-green-600">
              {potentialWin.toFixed(2)} Betoletas
            </span>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handlePlaceBet}
          disabled={loading || selections.length === 0 || success !== null}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processando...
            </div>
          ) : success ? (
            <div className="flex items-center gap-2">
              <span>✓</span>
              Aposta Realizada!
            </div>
          ) : (
            `Apostar ${potentialWin.toFixed(2)} Betoletas`
          )}
        </Button>

        {!isAuthenticated ? (
          <div className="text-xs text-center text-muted-foreground bg-amber-50 p-2 rounded border border-amber-200">
            <p>⚠️ Você precisa estar logado para apostar</p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
              onClick={() => router.push('/login')}
            >
              Fazer login
            </Button>
          </div>
        ) : (
          <div className="text-xs text-center text-gray-500 mt-2">
            <p>💰 Saldo disponível: Consulte sua carteira</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}