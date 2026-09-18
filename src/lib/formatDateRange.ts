export function formatDateRange(startDate: string, endDate?: string): string {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${fmt(startDate)} – ${endDate ? fmt(endDate) : 'Present'}`
}
