import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Database,
  FileCheck2,
  FileImage,
  Images,
  Info,
  LockKeyhole,
  LayoutDashboard,
  PackageCheck,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { productCategories } from '../config/research'
import type { CompanyProfile, ProductReferenceDraft } from '../types/company'
import { formatBytes, getMaxFileSizeBytes, MAX_IMAGE_COUNT, validateFiles, verifyImageReadable } from '../utils/fileValidation'
import { getCompanyDraftReadiness, validateCompanyProfile, validateProductReference } from '../utils/companyValidation'

type ReferenceView = 'front' | 'back' | 'side' | 'bottom' | 'code' | 'other'

interface ReferenceImage {
  id: string
  file: File
  view: ReferenceView
  previewUrl: string
}

const emptyCompany: CompanyProfile = {
  organizationName: '', organizationType: '', representativeName: '', workEmail: '', website: '',
}

const emptyProduct: ProductReferenceDraft = {
  brand: '', productName: '', category: '', variant: '', packageSize: '', targetMarket: '', packagingVersion: '', notes: '',
}

const steps = [
  { label: 'Organization', helper: 'Who is providing the reference?', icon: Building2 },
  { label: 'Product', helper: 'Identify the exact package.', icon: PackageCheck },
  { label: 'Package views', helper: 'Add clear reference images.', icon: Images },
  { label: 'Review', helper: 'Check before future submission.', icon: FileCheck2 },
]

const benefits = [
  { icon: Database, title: 'Structured references', text: 'Keep market, package-version, product, and image details together in a consistent format.' },
  { icon: BadgeCheck, title: 'Clear provenance', text: 'Record which organization supplied a packaging reference and what authority it represents.' },
  { icon: ShieldCheck, title: 'Controlled future intake', text: 'Prepare information for a reviewed backend workflow instead of accepting unverified public claims.' },
]

function suggestedReferenceView(index: number): ReferenceView {
  if (index === 0) return 'front'
  if (index === 1) return 'back'
  if (index === 2) return 'side'
  return 'code'
}

export function CompanyPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [company, setCompany] = useState<CompanyProfile>(emptyCompany)
  const [product, setProduct] = useState<ProductReferenceDraft>(emptyProduct)
  const [images, setImages] = useState<ReferenceImage[]>([])
  const [rightsConfirmed, setRightsConfirmed] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isReading, setIsReading] = useState(false)
  const [prepared, setPrepared] = useState(false)
  const imagesRef = useRef(images)
  const maxBytes = getMaxFileSizeBytes()

  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)), [])

  const addFiles = async (incoming: File[]) => {
    const validation = validateFiles(incoming, { maxBytes, existingCount: images.length })
    setErrors(validation.errors)
    if (!validation.validFiles.length) return
    setIsReading(true)
    const accepted: ReferenceImage[] = []
    const unreadable: string[] = []
    for (const file of validation.validFiles) {
      if (!(await verifyImageReadable(file))) {
        unreadable.push(`${file.name}: the browser could not read this image.`)
        continue
      }
      accepted.push({
        id: `${file.name}-${crypto.randomUUID()}`,
        file,
        view: suggestedReferenceView(images.length + accepted.length),
        previewUrl: URL.createObjectURL(file),
      })
    }
    setImages((current) => [...current, ...accepted])
    setErrors((current) => [...current, ...unreadable])
    setIsReading(false)
  }

  const removeImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((image) => image.id !== id)
    })
  }

  const validateStep = (step: number) => {
    let nextErrors: string[] = []
    if (step === 0) nextErrors = validateCompanyProfile(company)
    if (step === 1) nextErrors = validateProductReference(product)
    if (step === 2 && images.length === 0) nextErrors = ['Add at least one clear package reference image.']
    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  const moveNext = () => {
    if (!validateStep(activeStep)) return
    setActiveStep((step) => Math.min(step + 1, steps.length - 1))
  }

  const prepareDraft = () => {
    const readiness = getCompanyDraftReadiness(company, product, images.length, rightsConfirmed)
    const nextErrors = [...readiness.companyErrors, ...readiness.productErrors, ...readiness.imageErrors, ...readiness.rightsErrors]
    setErrors(nextErrors)
    if (readiness.complete) {
      setPrepared(true)
      window.scrollTo({ top: document.getElementById('company-workspace')?.offsetTop ?? 0, behavior: 'smooth' })
    }
  }

  const resetDraft = () => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setCompany(emptyCompany)
    setProduct(emptyProduct)
    setImages([])
    setRightsConfirmed(false)
    setErrors([])
    setPrepared(false)
    setActiveStep(0)
  }

  const companyReady = validateCompanyProfile(company).length === 0
  const productReady = validateProductReference(product).length === 0

  return (
    <>
      <section className="company-hero">
        <div className="container company-hero__grid">
          <div className="company-hero__copy">
            <p className="eyebrow"><span /> For brands & manufacturers</p>
            <h1>Make trusted packaging references easier to prepare.</h1>
            <p>RealOrFake’s company workspace is designed to help authorized organizations organize product and packaging information for a future reviewed reference library.</p>
            <div className="hero-actions">
              <a className="button" href="#company-workspace">Prepare a reference <ArrowRight size={18} aria-hidden="true" /></a>
              <Link className="text-link" to="/company/portal"><LayoutDashboard size={16} aria-hidden="true" /> View sample portal</Link>
            </div>
            <div className="company-trust-row">
              <span><LockKeyhole size={15} aria-hidden="true" /> Local draft only</span>
              <span><CircleHelp size={15} aria-hidden="true" /> Human review planned</span>
            </div>
          </div>
          <div className="company-hero__visual" aria-label="Illustration of a structured product reference workspace">
            <div className="reference-document">
              <div className="reference-document__top"><span>PRODUCT REFERENCE</span><strong>Draft</strong></div>
              <div className="reference-product-mark"><PackageCheck aria-hidden="true" /><div><strong>Package identity</strong><small>Product · market · version</small></div></div>
              <div className="reference-lines"><span /><span /><span /></div>
              <div className="reference-thumbnails"><i /><i /><i /></div>
              <div className="reference-document__status"><CheckCircle2 aria-hidden="true" /> Structured for review</div>
            </div>
            <div className="company-visual-note company-visual-note--one"><BadgeCheck aria-hidden="true" /><span><strong>Source context</strong><small>Organization & authority</small></span></div>
            <div className="company-visual-note company-visual-note--two"><Images aria-hidden="true" /><span><strong>Package views</strong><small>Front, back & details</small></span></div>
          </div>
        </div>
      </section>

      <section className="company-benefits-section">
        <div className="container company-benefits">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title}><Icon aria-hidden="true" /><div><h2>{title}</h2><p>{text}</p></div></article>
          ))}
        </div>
      </section>

      <section id="company-process" className="section company-process-section">
        <div className="container company-process-grid">
          <div>
            <p className="eyebrow">A clear intake path</p>
            <h2>Know what to prepare before anything is submitted.</h2>
            <p className="company-process-lede">The future workflow separates company identity, exact product information, and packaging evidence so reviewers can understand where every reference came from.</p>
          </div>
          <div className="company-process-list">
            {steps.map(({ icon: Icon, label, helper }, index) => (
              <div key={label}><span>0{index + 1}</span><Icon aria-hidden="true" /><div><strong>{label}</strong><p>{helper}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="company-workspace" className="section company-workspace-section">
        <div className="container">
          <div className="workspace-heading">
            <div><p className="eyebrow">Company workspace prototype</p><h2>Prepare a product reference draft</h2></div>
            <div className="workspace-notice"><Info aria-hidden="true" /><p><strong>Nothing is submitted or stored.</strong> This guided workspace demonstrates future company intake using browser memory only.</p></div>
          </div>

          {prepared ? (
            <div className="prepared-card" role="status">
              <div className="prepared-icon"><Check aria-hidden="true" /></div>
              <p className="eyebrow">Local draft prepared</p>
              <h2>{product.brand} {product.productName}</h2>
              <p>Your information is organized and ready for a future connected review workflow. It has not been uploaded, saved, approved, or added to a reference database.</p>
              <div className="prepared-summary">
                <div><span>Organization</span><strong>{company.organizationName}</strong></div>
                <div><span>Market</span><strong>{product.targetMarket}</strong></div>
                <div><span>Package version</span><strong>{product.packagingVersion}</strong></div>
                <div><span>Reference images</span><strong>{images.length}</strong></div>
              </div>
              <div className="prepared-actions">
                <button className="button" type="button" onClick={() => { setPrepared(false); setActiveStep(3) }}>Review draft</button>
                <button className="button button--outline" type="button" onClick={resetDraft}>Start another draft</button>
              </div>
            </div>
          ) : (
            <div className="company-wizard">
              <aside className="wizard-sidebar" aria-label="Reference preparation progress">
                <p>Draft progress</p>
                {steps.map(({ label, helper, icon: Icon }, index) => {
                  const complete = (index === 0 && companyReady) || (index === 1 && productReady) || (index === 2 && images.length > 0) || (index === 3 && rightsConfirmed)
                  return (
                    <button
                      key={label}
                      type="button"
                      className={activeStep === index ? 'wizard-step wizard-step--active' : 'wizard-step'}
                      onClick={() => { setErrors([]); setActiveStep(index) }}
                      aria-current={activeStep === index ? 'step' : undefined}
                    >
                      <span className="wizard-step__icon">{complete ? <Check aria-hidden="true" /> : <Icon aria-hidden="true" />}</span>
                      <span><strong>{label}</strong><small>{helper}</small></span>
                    </button>
                  )
                })}
                <div className="wizard-privacy"><LockKeyhole aria-hidden="true" /><span><strong>Browser memory only</strong><small>Refreshing the page clears this draft.</small></span></div>
              </aside>

              <div className="wizard-content">
                <div className="wizard-mobile-progress"><span>Step {activeStep + 1} of {steps.length}</span><div><i style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} /></div></div>

                {activeStep === 0 && (
                  <div className="wizard-panel">
                    <p className="eyebrow">Step 1 · Organization</p>
                    <h3>Who is providing this reference?</h3>
                    <p className="wizard-intro">Use an official organizational identity so the source of future reference material is clear.</p>
                    <div className="wizard-form-grid">
                      <label className="field field--wide">Organization name <span aria-hidden="true">*</span><input value={company.organizationName} onChange={(event) => setCompany({ ...company, organizationName: event.target.value })} placeholder="Official organization name" /></label>
                      <label className="field">Organization type <span aria-hidden="true">*</span><select value={company.organizationType} onChange={(event) => setCompany({ ...company, organizationType: event.target.value })}><option value="">Choose a type</option><option>Brand owner</option><option>Manufacturer</option><option>Authorized distributor</option><option>Regulatory or research body</option><option>Other authorized organization</option></select></label>
                      <label className="field">Representative name <span aria-hidden="true">*</span><input value={company.representativeName} onChange={(event) => setCompany({ ...company, representativeName: event.target.value })} placeholder="Full name" /></label>
                      <label className="field">Work email <span aria-hidden="true">*</span><input type="email" value={company.workEmail} onChange={(event) => setCompany({ ...company, workEmail: event.target.value })} placeholder="name@company.com" /></label>
                      <label className="field">Official website <small>Optional</small><input type="url" value={company.website} onChange={(event) => setCompany({ ...company, website: event.target.value })} placeholder="https://company.com" /></label>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="wizard-panel">
                    <p className="eyebrow">Step 2 · Product</p>
                    <h3>Identify the exact product package.</h3>
                    <p className="wizard-intro">Market and version details matter because legitimate packaging can vary across regions and release periods.</p>
                    <div className="wizard-form-grid">
                      <label className="field">Brand name <span aria-hidden="true">*</span><input value={product.brand} onChange={(event) => setProduct({ ...product, brand: event.target.value })} placeholder="Brand shown on package" /></label>
                      <label className="field">Product name <span aria-hidden="true">*</span><input value={product.productName} onChange={(event) => setProduct({ ...product, productName: event.target.value })} placeholder="Exact product name" /></label>
                      <label className="field">Category <span aria-hidden="true">*</span><select value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })}><option value="">Choose a category</option>{productCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
                      <label className="field">Variant <small>Optional</small><input value={product.variant} onChange={(event) => setProduct({ ...product, variant: event.target.value })} placeholder="Shade, scent, formula…" /></label>
                      <label className="field">Package size <small>Optional</small><input value={product.packageSize} onChange={(event) => setProduct({ ...product, packageSize: event.target.value })} placeholder="e.g. 50 mL" /></label>
                      <label className="field">Intended market or region <span aria-hidden="true">*</span><input value={product.targetMarket} onChange={(event) => setProduct({ ...product, targetMarket: event.target.value })} placeholder="e.g. Bangladesh, EU" /></label>
                      <label className="field field--wide">Packaging version or release period <span aria-hidden="true">*</span><input value={product.packagingVersion} onChange={(event) => setProduct({ ...product, packagingVersion: event.target.value })} placeholder="e.g. 2026 carton redesign, version 2" /></label>
                      <label className="field field--wide">Reference notes <small>Optional</small><textarea value={product.notes} onChange={(event) => setProduct({ ...product, notes: event.target.value })} placeholder="Explain regional markings, known package changes, or other useful context." /></label>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="wizard-panel">
                    <p className="eyebrow">Step 3 · Package views</p>
                    <h3>Add clear, official reference images.</h3>
                    <p className="wizard-intro">Use original packaging photos or approved artwork that clearly shows layout, text, codes, and market-specific details.</p>
                    <label className="company-upload" htmlFor="company-reference-images">
                      <span><Plus aria-hidden="true" /></span>
                      <strong>{isReading ? 'Checking images…' : 'Choose reference images'}</strong>
                      <small>JPEG, PNG, or WebP · up to {MAX_IMAGE_COUNT} files · {formatBytes(maxBytes)} each</small>
                    </label>
                    <input id="company-reference-images" className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event: ChangeEvent<HTMLInputElement>) => { void addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} disabled={isReading || images.length >= MAX_IMAGE_COUNT} />
                    {images.length > 0 && (
                      <div className="company-image-grid">
                        {images.map((image) => (
                          <article key={image.id}>
                            <img src={image.previewUrl} alt={`${image.view} reference preview`} />
                            <div>
                              <label>View<select value={image.view} onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, view: event.target.value as ReferenceView } : item))}><option value="front">Front</option><option value="back">Back</option><option value="side">Side</option><option value="bottom">Bottom</option><option value="code">Code or seal</option><option value="other">Other detail</option></select></label>
                              <p><FileImage size={14} aria-hidden="true" /><span>{image.file.name}</span><small>{formatBytes(image.file.size)}</small></p>
                              <button type="button" onClick={() => removeImage(image.id)}><Trash2 size={14} aria-hidden="true" /> Remove</button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    <div className="reference-photo-guidance"><Info aria-hidden="true" /><p><strong>Useful set:</strong> front, back, one side panel, and a close-up of the batch-code or security-detail area. Avoid personal documents or unrelated background information.</p></div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="wizard-panel">
                    <p className="eyebrow">Step 4 · Review</p>
                    <h3>Review the draft before future submission.</h3>
                    <p className="wizard-intro">This summary helps catch missing context. Preparing it does not verify the organization or approve the product reference.</p>
                    <div className="review-sections">
                      <section><div><Building2 aria-hidden="true" /><strong>Organization</strong></div><dl><dt>Name</dt><dd>{company.organizationName || 'Not provided'}</dd><dt>Type</dt><dd>{company.organizationType || 'Not provided'}</dd><dt>Representative</dt><dd>{company.representativeName || 'Not provided'}</dd><dt>Email</dt><dd>{company.workEmail || 'Not provided'}</dd></dl><button type="button" onClick={() => setActiveStep(0)}>Edit</button></section>
                      <section><div><PackageCheck aria-hidden="true" /><strong>Product reference</strong></div><dl><dt>Product</dt><dd>{[product.brand, product.productName].filter(Boolean).join(' ') || 'Not provided'}</dd><dt>Category</dt><dd>{product.category || 'Not provided'}</dd><dt>Market</dt><dd>{product.targetMarket || 'Not provided'}</dd><dt>Version</dt><dd>{product.packagingVersion || 'Not provided'}</dd></dl><button type="button" onClick={() => setActiveStep(1)}>Edit</button></section>
                      <section><div><Images aria-hidden="true" /><strong>Package views</strong></div><dl><dt>Files</dt><dd>{images.length || 'None'}</dd><dt>Views</dt><dd>{images.length ? images.map((image) => image.view).join(', ') : 'Not provided'}</dd></dl><button type="button" onClick={() => setActiveStep(2)}>Edit</button></section>
                    </div>
                    <label className="rights-confirmation"><input type="checkbox" checked={rightsConfirmed} onChange={(event) => setRightsConfirmed(event.target.checked)} /><span><strong>I confirm that my organization is authorized to provide these materials.</strong><small>This confirmation would support a future review. It does not grant approval or verification by itself.</small></span></label>
                  </div>
                )}

                {errors.length > 0 && <div className="form-alert form-alert--error" role="alert"><Info aria-hidden="true" /><div><strong>Please complete these items</strong>{errors.map((error) => <p key={error}>{error}</p>)}</div></div>}

                <div className="wizard-actions">
                  <button className="text-action" type="button" disabled={activeStep === 0} onClick={() => { setErrors([]); setActiveStep((step) => Math.max(0, step - 1)) }}><ArrowLeft size={17} aria-hidden="true" /> Back</button>
                  {activeStep < steps.length - 1 ? (
                    <button className="button" type="button" onClick={moveNext}>Continue <ChevronRight size={18} aria-hidden="true" /></button>
                  ) : (
                    <button className="button" type="button" onClick={prepareDraft}>Prepare local draft <Check size={18} aria-hidden="true" /></button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="company-boundary-section">
        <div className="container company-boundary">
          <div><p className="eyebrow">Designed boundaries</p><h2>Company references inform screening. They do not replace independent review.</h2></div>
          <div><p>Future company submissions should be reviewed for authorization, completeness, market scope, and package version before they enter any reference library.</p><p>RealOrFake will still report uncertainty and will not treat a company-supplied reference as a safety certification.</p></div>
        </div>
      </section>
    </>
  )
}
