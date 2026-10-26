import { AlertTriangle, CircleCheck, CircleHelp, Ban } from 'lucide-react'
import type { ScreeningOutcome } from '../types/analysis'

const outcomeMeta: Record<ScreeningOutcome, { label: string; className: string; icon: typeof CircleCheck }> = {
  'likely-genuine': { label: 'Likely genuine', className: 'outcome--positive', icon: CircleCheck },
  'suspicious-packaging': { label: 'Suspicious packaging', className: 'outcome--warning', icon: AlertTriangle },
  'insufficient-evidence': { label: 'Insufficient evidence', className: 'outcome--neutral', icon: CircleHelp },
  'unsupported-product': { label: 'Unsupported product', className: 'outcome--unsupported', icon: Ban },
}

export function OutcomeBadge({ outcome }: { outcome: ScreeningOutcome }) {
  const meta = outcomeMeta[outcome]
  const Icon = meta.icon
  return <span className={`outcome-badge ${meta.className}`}><Icon size={16} aria-hidden="true" />{meta.label}</span>
}
