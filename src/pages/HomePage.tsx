import { ArrowRight, Building2, Camera, ScanText, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PackagingVisual } from '../components/PackagingVisual'
import { productCategories } from '../config/research'

const categorySymbols: Record<string, string> = {
  Skincare: '○', Haircare: '≈', Makeup: '✦', Fragrance: '◇', 'Nail products': '◒', 'Oral care': '⌁',
}

export function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Multimodal packaging research</p>
            <h1>Look closer at what’s <em>on the package.</em></h1>
            <p className="hero-lede">
              RealOrFake is a research interface designed to screen cosmetics packaging using visual details and written information—together, not in isolation.
            </p>
            <div className="hero-actions">
              <Link className="button" to="/check">Check a product <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link className="text-link" to="/research">How it works <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="privacy-note">
              <ShieldCheck aria-hidden="true" />
              <p><strong>Private by default</strong><br />Photos stay in your browser while the model is disconnected.</p>
            </div>
          </div>
          <PackagingVisual />
        </div>
      </section>

      <section className="context-strip">
        <div className="container context-grid">
          <p><span>01</span> One product at a time</p>
          <p><span>02</span> Multiple packaging views</p>
          <p><span>03</span> Evidence, not certification</p>
        </div>
      </section>

      <section className="section section--story">
        <div className="container">
          <div className="section-heading split-heading">
            <div><p className="eyebrow">Two evidence streams</p><h2>Packaging tells more than one story.</h2></div>
            <p>A strong screen should consider what a package looks like and what it says. The planned system brings both evidence types into one careful review.</p>
          </div>
          <div className="method-grid">
            <article className="method-card method-card--image">
              <div className="method-number">01</div>
              <div className="method-icon"><Camera aria-hidden="true" /></div>
              <h3>See the visual structure</h3>
              <p>The image component is planned to assess visual patterns such as layout, print regions, proportions, and package presentation.</p>
              <ul><li>Front-of-pack layout</li><li>Label regions & visual cues</li><li>Photo-quality checks</li></ul>
              <div className="card-watermark" aria-hidden="true">IMAGE</div>
            </article>
            <article className="method-card method-card--text">
              <div className="method-number">02</div>
              <div className="method-icon"><ScanText aria-hidden="true" /></div>
              <h3>Read the written evidence</h3>
              <p>Packaging text will be extracted, compared by meaning, and checked for product-specific fields that should be present and consistent.</p>
              <ul><li>Product and variant names</li><li>Volume & market details</li><li>Relevant field mismatches</li></ul>
              <div className="card-watermark" aria-hidden="true">TEXT</div>
            </article>
          </div>
        </div>
      </section>

      <section className="section category-section">
        <div className="container category-layout">
          <div className="category-copy">
            <p className="eyebrow">Designed for cosmetics</p>
            <h2>One approach, across the bathroom shelf.</h2>
            <p>The project scope spans common personal-care categories while leaving room for product-specific packaging fields and references.</p>
            <Link className="text-link" to="/check">Start with your product <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="category-grid">
            {productCategories.map((category, index) => (
              <div className="category-card" key={category}>
                <span className="category-symbol" aria-hidden="true">{categorySymbols[category]}</span>
                <div><span>0{index + 1}</span><h3>{category}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="company-home-section">
        <div className="container company-home-card">
          <div className="company-home-icon"><Building2 aria-hidden="true" /></div>
          <div><p className="eyebrow">For brands & manufacturers</p><h2>Help prepare reliable packaging references.</h2><p>Authorized organizations can organize company, product, market, version, and package-view information in a guided local workspace.</p></div>
          <Link className="button button--light" to="/company">Explore company workspace <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="section research-callout-section">
        <div className="container research-callout">
          <div className="callout-icon"><Sparkles aria-hidden="true" /></div>
          <div>
            <p className="eyebrow">Research status</p>
            <h2>The interface is ready. The model is not connected—yet.</h2>
            <p>The current experience prepares and validates inputs locally. It never creates a random authenticity result. Fictional examples are available separately to demonstrate future result layouts.</p>
          </div>
          <div className="callout-actions">
            <Link className="button button--light" to="/demo">Explore demo results</Link>
            <Link className="text-link text-link--light" to="/research">Read the research approach</Link>
          </div>
        </div>
      </section>

      <section className="section final-cta-section">
        <div className="container final-cta">
          <p className="eyebrow">A better photo makes better evidence</p>
          <h2>Ready to prepare a product check?</h2>
          <Link className="button" to="/check">Check a product <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  )
}
