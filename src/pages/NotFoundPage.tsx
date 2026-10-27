import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="not-found-section">
      <div className="container not-found-card">
        <div><Compass aria-hidden="true" /></div>
        <p className="eyebrow">Page not found</p>
        <h1>This page isn’t part of the current prototype.</h1>
        <p>Return to the RealOrFake home page or continue with a product check.</p>
        <div><Link className="button" to="/"><ArrowLeft size={17} aria-hidden="true" /> Back home</Link><Link className="text-link" to="/check">Check a product</Link></div>
      </div>
    </section>
  )
}
