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
  selections: BetSelection[];
  amount: string;
  totalOdds: number;
  potentialWin: number;
  addSelection: (selection: BetSelection) => void;
  removeSelection: (matchId: string, marketType: string) => void;
  clearSelections: () => void;
  setAmount: (amount: string) => void;
  recalculateTotals: () => void;
}

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set, get) => {
  const recalculateTotals = () => {
    const { selections, amount } = get();
    const numericAmount = parseFloat(amount) || 0;
    const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
    const potentialWin = numericAmount * totalOdds;
    set({ totalOdds, potentialWin });
  };

  return {
    selections: [],
    amount: '10.00',
    totalOdds: 1,
    potentialWin: 0,
    addSelection: (selection: BetSelection) => {
      set((state) => {
        const filteredSelections = state.selections.filter(s => 
          !(s.matchId === selection.matchId && s.marketType === selection.marketType)
        );
        
        return {
          selections: [...filteredSelections, selection],
        };
      });
      recalculateTotals();
    },
    removeSelection: (matchId, marketType) => {
      set((state) => ({
        selections: state.selections.filter(s => !(s.matchId === matchId && s.marketType === marketType)),
      }));
      recalculateTotals();
    },
    setAmount: (amount) => {
      set({ amount });
      recalculateTotals();
    },
    clearSelections: () => {
      set({ selections: [], amount: '10.00' });
      recalculateTotals();
    },
    recalculateTotals,
  };
    },
    {
      name: 'bet-slip-storage',
      partialize: (state) => ({
        selections: state.selections,
        amount: state.amount,
      }),
    }
  )
);

function calculateTotalOdds(selections: BetSelection[]): number {
  if (selections.length === 0) return 1
  
  return selections.reduce((acc, selection) => acc * selection.odds, 1)
}