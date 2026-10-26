import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { AnalysisResultView } from '../components/AnalysisResultView'
import { OutcomeBadge } from '../components/OutcomeBadge'
import { demoResults } from '../data/demoResults'

export function DemoPage() {
  const [selectedId, setSelectedId] = useState(demoResults[0].requestId)
  const selected = useMemo(() => demoResults.find((result) => result.requestId === selectedId) ?? demoResults[0], [selectedId])

  return (
    <>
      <section className="page-hero page-hero--demo">
        <div className="container narrow">
          <p className="eyebrow"><FlaskConical size={16} aria-hidden="true" /> Explore demo results</p>
          <h1>See how evidence could be reported.</h1>
          <p>These fictional fixtures demonstrate the future result interface. They are simulated, fixed, and entirely unrelated to anything you upload.</p>
        </div>
      </section>
      <section className="section demo-section">
        <div className="container">
          <div className="demo-picker" role="group" aria-label="Choose a fictional demo result">
            {demoResults.map((result) => (
              <button
                key={result.requestId}
                type="button"
                className={selectedId === result.requestId ? 'demo-option demo-option--active' : 'demo-option'}
                onClick={() => setSelectedId(result.requestId)}
                aria-pressed={selectedId === result.requestId}
              >
                <OutcomeBadge outcome={result.outcome} />
                <strong>{result.demoTitle}</strong>
                <span>{result.demoProduct}</span>
              </button>
            ))}
          </div>
          <AnalysisResultView result={selected} simulated />
        </div>
      </section>
    </>
  )
}
