export function PackagingVisual() {
  return (
    <div className="packaging-visual" aria-label="Illustration of cosmetic packages being compared">
      <div className="visual-grid" aria-hidden="true" />
      <div className="scan-corner scan-corner--one" aria-hidden="true" />
      <div className="scan-corner scan-corner--two" aria-hidden="true" />
      <div className="package package--tube" aria-hidden="true">
        <span className="package-cap" />
        <span className="package-copy package-copy--wide" />
        <span className="package-copy" />
        <span className="package-seal">R/F</span>
      </div>
      <div className="package package--bottle" aria-hidden="true">
        <span className="bottle-pump" />
        <span className="package-copy package-copy--wide" />
        <span className="package-copy" />
        <span className="package-copy package-copy--short" />
      </div>
      <div className="evidence-note evidence-note--top" aria-hidden="true">
        <span className="evidence-icon">Aa</span>
        <span><strong>Text fields</strong><small>Compared by meaning</small></span>
      </div>
      <div className="evidence-note evidence-note--bottom" aria-hidden="true">
        <span className="evidence-icon evidence-icon--mint">◎</span>
        <span><strong>Visual cues</strong><small>Structure & details</small></span>
      </div>
      <div className="visual-caption"><span /> Evidence layers</div>
    </div>
  )
}
