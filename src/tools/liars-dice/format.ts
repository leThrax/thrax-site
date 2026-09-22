export function formatPercent(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`
}
