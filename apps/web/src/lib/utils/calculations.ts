export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function calculatePotentialWin(amount: number, totalOdds: number): number {
  return Math.floor(amount * totalOdds);
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('pt-BR');
}

export function calculateWinRate(wonBets: number, totalBets: number): string {
  if (totalBets === 0) return '0.0';
  return ((wonBets / totalBets) * 100).toFixed(1);
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function getOddsColor(odds: number): string {
  if (odds <= 1.5) return 'text-red-600';
  if (odds <= 2.0) return 'text-orange-600';
  if (odds <= 3.0) return 'text-yellow-600';
  return 'text-green-600';
}

export function calculateImpliedProbability(odds: number): number {
  return (1 / odds) * 100;
}