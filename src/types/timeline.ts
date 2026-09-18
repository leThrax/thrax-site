export interface TimelineEntry {
  id: string
  role: string
  org: string
  startDate: string // ISO date, e.g. "2023-01-01"
  endDate?: string // undefined means ongoing
  description?: string
  position: number
}
