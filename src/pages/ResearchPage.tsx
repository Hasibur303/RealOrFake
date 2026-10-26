import { BrainCircuit, Camera, Combine, FileSearch, Images, ScanText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { researchConfig } from '../config/research'

const steps = [
  { icon: Images, title: 'Upload product photos', text: 'Supply a clear front image, then add back or detail views when they carry useful text.' },
  { icon: Camera, title: 'Assess image quality', text: 'Check focus, glare, framing, and whether the package provides enough usable evidence.' },
  { icon: BrainCircuit, title: 'Analyze package images', text: 'A planned ResNet50 component evaluates learned visual packaging features.' },
  { icon: ScanText, title: 'Extract packaging text', text: 'EasyOCR reads visible labels, claims, volume information, and other text regions.' },
  { icon: FileSearch, title: 'Compare a reference', text: 'Sentence-BERT and field checks compare extracted text with the appropriate package reference.' },
  { icon: Combine, title: 'Combine the evidence', text: 'The system reports aligned signals, differences, missing evidence, and practical next steps.' },
]

export function ResearchPage() {
  return (
    <>
      <section className="page-hero page-hero--research">
        <div className="container narrow">
          <p className="eyebrow">How it works</p>
          <h1>From package photos to an evidence-led screen.</h1>
          <p>The planned pipeline combines image structure and packaging language while keeping uncertainty visible at every stage.</p>
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="process-list">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <article className="process-step" key={step.title}>
                  <div className="process-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="process-icon"><Icon aria-hidden="true" /></div>
                  <div><h2>{step.title}</h2><p>{step.text}</p></div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section section--mint">
        <div className="container">
          <div className="section-heading split-heading">
            <div><p className="eyebrow">Planned methods</p><h2>Three tools, three distinct jobs.</h2></div>
            <p>Each component contributes a different type of evidence. No single score should be treated as proof that a product is genuine.</p>
          </div>
          <div className="technology-grid">
            <article><span>01</span><h3>{researchConfig.methods.imageModel}</h3><p>A pretrained convolutional neural network planned for adaptation to visual genuine/counterfeit packaging classification.</p><strong>Packaging-image analysis</strong></article>
            <article><span>02</span><h3>{researchConfig.methods.textExtraction}</h3><p>Optical character recognition used to locate and transcribe the written content visible on product packaging.</p><strong>Text extraction</strong></article>
            <article><span>03</span><h3>{researchConfig.methods.textComparison}</h3><p>A language model used to compare meaning, paired with exact checks for important product-specific fields.</p><strong>Semantic comparison</strong></article>
          </div>
        </div>
      </section>

      <section className="section limitations-section">
        <div className="container limitations-grid">
          <div>
            <p className="eyebrow">Interpreting results</p>
            <h2>Packaging is not always identical—even when it is legitimate.</h2>
          </div>
          <div className="limitations-list">
            {researchConfig.limitations.map((limitation, index) => (
              <div key={limitation}><span>0{index + 1}</span><p>{limitation}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section research-project-section">
        <div className="container project-card">
          <p className="eyebrow">Final Year Design Project</p>
          <h2>{researchConfig.projectTitle}</h2>
          <div className="project-card__bottom">
            <p>Team and university details are intentionally left configurable until verified project information is supplied.</p>
            <Link className="button button--light" to="/check">Prepare a product check</Link>
          </div>
        </div>
      </section>
    </>
  )
}
