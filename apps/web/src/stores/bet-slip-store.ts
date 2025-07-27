// apps/web/src/stores/bet-slip-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BetSelection {
  matchId: string
  matchName: string
  marketType: string
  marketName: string
  selection: string
  odds: number
}

interface BetSlipState {
  selections: BetSelection[]
  amount: number
  totalOdds: number
  potentialWin: number
  addSelection: (selection: BetSelection) => void
  removeSelection: (matchId: string, marketType: string) => void
  clearSelections: () => void
  setAmount: (amount: number) => void
  updateOdds: (matchId: string, marketType: string, newOdds: number) => void
}

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set, get) => ({
      selections: [],
      amount: 50, // Valor padrão
      totalOdds: 1,
      potentialWin: 0,

      addSelection: (selection) => {
        set((state) => {
          // Remove seleção anterior do mesmo jogo
          const filtered = state.selections.filter(
            s => s.matchId !== selection.matchId
          )
          
          const newSelections = [...filtered, selection]
          const totalOdds = calculateTotalOdds(newSelections)
          const potentialWin = state.amount * totalOdds
          
          return {
            selections: newSelections,
            totalOdds,
            potentialWin
          }
        })
      },

      removeSelection: (matchId, marketType) => {
        set((state) => {
          const newSelections = state.selections.filter(
            s => !(s.matchId === matchId && s.marketType === marketType)
          )
          
          const totalOdds = calculateTotalOdds(newSelections)
          const potentialWin = state.amount * totalOdds
          
          return {
            selections: newSelections,
            totalOdds,
            potentialWin
          }
        })
      },

      clearSelections: () => {
        set({
          selections: [],
          totalOdds: 1,
          potentialWin: 0
        })
      },

      setAmount: (amount) => {
        set((state) => ({
          amount,
          potentialWin: amount * state.totalOdds
        }))
      },

      updateOdds: (matchId, marketType, newOdds) => {
        set((state) => {
          const newSelections = state.selections.map(s => 
            s.matchId === matchId && s.marketType === marketType
              ? { ...s, odds: newOdds }
              : s
          )
          
          const totalOdds = calculateTotalOdds(newSelections)
          const potentialWin = state.amount * totalOdds
          
          return {
            selections: newSelections,
            totalOdds,
            potentialWin
          }
        })
      }
    }),
    {
      name: 'bet-slip-storage',
      partialize: (state) => ({ 
        selections: state.selections,
        amount: state.amount 
      })
    }
  )
)

function calculateTotalOdds(selections: BetSelection[]): number {
  if (selections.length === 0) return 1
  
  return selections.reduce((acc, selection) => acc * selection.odds, 1)
}