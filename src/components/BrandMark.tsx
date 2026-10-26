import { Link } from 'react-router-dom'

export function BrandMark() {
  return (
    <Link className="brand-mark" to="/" aria-label="RealOrFake home">
      <span className="brand-symbol" aria-hidden="true">
        <span className="brand-symbol__line" />
      </span>
      <span>
        <span className="brand-name">Real<span>Or</span>Fake</span>
        <span className="brand-subtitle">Packaging evidence, made clearer</span>
      </span>
    </Link>
  )
}
