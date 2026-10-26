import { AlertCircle, Camera, CheckCircle2, FileText, ScanText, ShieldQuestion } from 'lucide-react'
import type { AnalysisResponse } from '../types/analysis'
import { OutcomeBadge } from './OutcomeBadge'

export function AnalysisResultView({ result, simulated = false }: { result: AnalysisResponse; simulated?: boolean }) {
  return (
    <div className="result-layout">
      {simulated && (
        <div className="demo-banner" role="note">
          <span className="demo-tag">Simulated</span>
          <p><strong>Fictional demonstration only.</strong> This result is not connected to your uploads and was not produced by a model.</p>
        </div>
      )}

      <section className="result-hero surface-card">
        <div>
          <p className="eyebrow">Overall screening outcome</p>
          <OutcomeBadge outcome={result.outcome} />
          <h2>{result.summary}</h2>
          <p className="result-disclaimer">This is supporting evidence, not certification of authenticity or product safety.</p>
        </div>
        <div className="result-reasons">
          <p className="mini-heading">Why this outcome</p>
          <ul>{result.reasons.map((reason) => <li key={reason}><CheckCircle2 size={16} aria-hidden="true" />{reason}</li>)}</ul>
        </div>
      </section>

      <div className="result-columns">
        <div className="result-main">
          <section className="surface-card result-section">
            <div className="section-icon"><Camera aria-hidden="true" /></div>
            <div className="result-section__content">
              <p className="eyebrow">Packaging-image assessment</p>
              <h3>{result.imageModel?.label ?? 'No image-model output available'}</h3>
              {result.imageModel?.notes?.map((note) => <p key={note}>{note}</p>)}
              <div className="quality-list">
                {result.imageQuality.map((image) => (
                  <div key={image.imageId} className="quality-row">
                    <span className="view-chip">{image.view}</span>
                    <span>{image.usable ? 'Usable image' : 'Needs a retake'}</span>
                    <small>{image.issues.length ? image.issues.join(' · ') : 'No quality issues found'}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="surface-card result-section">
            <div className="section-icon"><ScanText aria-hidden="true" /></div>
            <div className="result-section__content">
              <p className="eyebrow">Extracted packaging text</p>
              <h3>{result.extractedText.length ? 'Text found in supplied views' : 'No text available'}</h3>
              <div className="ocr-list">
                {result.extractedText.map((block, index) => (
                  <blockquote key={`${block.text}-${index}`}>
                    “{block.text}”
                    <footer>
                      {block.sourceView && <span>{block.sourceView} image</span>}
                      {typeof block.confidence === 'number' && <span>OCR confidence {Math.round(block.confidence * 100)}%</span>}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>

          <section className="surface-card result-section">
            <div className="section-icon"><FileText aria-hidden="true" /></div>
            <div className="result-section__content">
              <p className="eyebrow">Reference & text comparison</p>
              <h3>{result.referenceMatch?.referenceName ?? 'No matching reference selected'}</h3>
              {result.referenceMatch && (
                <div className="reference-meta">
                  {result.referenceMatch.market && <span>Market: {result.referenceMatch.market}</span>}
                  {result.referenceMatch.packagingVersion && <span>Version: {result.referenceMatch.packagingVersion}</span>}
                  {typeof result.referenceMatch.textSimilarity === 'number' && (
                    <span>Text similarity: {Math.round(result.referenceMatch.textSimilarity * 100)}%</span>
                  )}
                </div>
              )}
              {typeof result.referenceMatch?.textSimilarity === 'number' && (
                <p className="field-note">Text similarity measures language alignment. It is not the probability that the product is genuine.</p>
              )}
              {result.fieldMismatches.length > 0 ? (
                <div className="mismatch-table">
                  {result.fieldMismatches.map((mismatch) => (
                    <div className="mismatch-row" key={mismatch.field}>
                      <span className={`severity severity--${mismatch.severity}`} />
                      <strong>{mismatch.field}</strong>
                      <span>Observed: {mismatch.observed ?? 'Unavailable'}</span>
                      <span>Reference: {mismatch.expected ?? 'Unavailable'}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="empty-inline">No field mismatches are shown for this result.</p>}
            </div>
          </section>
        </div>

        <aside className="result-sidebar">
          <section className="surface-card side-card">
            <AlertCircle aria-hidden="true" />
            <p className="mini-heading">Missing or limited</p>
            {result.missingInformation.length ? (
              <ul>{result.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : <p>No missing information reported.</p>}
          </section>
          <section className="surface-card side-card side-card--teal">
            <ShieldQuestion aria-hidden="true" />
            <p className="mini-heading">Suggested next steps</p>
            <ol>{result.suggestedNextSteps.map((item) => <li key={item}>{item}</li>)}</ol>
          </section>
          {result.modelVersion && <p className="model-version">Model version: {result.modelVersion}</p>}
        </aside>
      </div>
    </div>
  )
}
