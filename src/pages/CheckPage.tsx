import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  FileImage,
  Info,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { AnalysisResultView } from '../components/AnalysisResultView'
import { productCategories } from '../config/research'
import { getServiceAvailability, requestAnalysis } from '../services/analysisService'
import type { AnalysisResponse, ImageView, ProductDetails } from '../types/analysis'
import { AnalysisServiceError } from '../types/analysis'
import { formatBytes, getMaxFileSizeBytes, MAX_IMAGE_COUNT, validateFiles, verifyImageReadable } from '../utils/fileValidation'

interface LocalImage {
  id: string
  file: File
  view: ImageView
  previewUrl: string
}

const emptyProduct: ProductDetails = { category: '', brand: '', variant: '', packageSize: '' }

function suggestedView(index: number): ImageView {
  if (index === 0) return 'front'
  if (index === 1) return 'back'
  return 'detail'
}

export function CheckPage() {
  const [images, setImages] = useState<LocalImage[]>([])
  const [product, setProduct] = useState<ProductDetails>(emptyProduct)
  const [errors, setErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serviceError, setServiceError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const imagesRef = useRef(images)
  const service = getServiceAvailability()
  const maxBytes = getMaxFileSizeBytes()

  useEffect(() => { imagesRef.current = images }, [images])
  useEffect(() => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)), [])

  const addFiles = async (incoming: File[]) => {
    setServiceError(null)
    const validation = validateFiles(incoming, { maxBytes, existingCount: images.length })
    setErrors(validation.errors)
    if (!validation.validFiles.length) return

    setIsReading(true)
    const next: LocalImage[] = []
    const unreadable: string[] = []

    for (const file of validation.validFiles) {
      const readable = await verifyImageReadable(file)
      if (!readable) {
        unreadable.push(`${file.name}: the browser could not read this image.`)
        continue
      }
      const index = images.length + next.length
      next.push({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        view: suggestedView(index),
        previewUrl: URL.createObjectURL(file),
      })
    }

    setImages((current) => [...current, ...next])
    setErrors((current) => [...current, ...unreadable])
    setIsReading(false)
  }

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    void addFiles(Array.from(event.dataTransfer.files))
  }

  const removeImage = (id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((image) => image.id !== id)
    })
  }

  const replaceImage = async (id: string, file?: File) => {
    if (!file) return
    const validation = validateFiles([file], { maxBytes, existingCount: images.length - 1 })
    if (!validation.validFiles.length) {
      setErrors(validation.errors)
      return
    }
    setIsReading(true)
    const readable = await verifyImageReadable(file)
    if (!readable) {
      setErrors([`${file.name}: the browser could not read this image.`])
      setIsReading(false)
      return
    }
    setImages((current) => current.map((image) => {
      if (image.id !== id) return image
      URL.revokeObjectURL(image.previewUrl)
      return { ...image, id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, file, previewUrl: URL.createObjectURL(file) }
    }))
    setErrors([])
    setIsReading(false)
  }

  const clearAll = () => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    setImages([])
    setErrors([])
    setResult(null)
    setServiceError(null)
  }

  const submit = async () => {
    if (!images.some((image) => image.view === 'front')) {
      setErrors(['Choose one image as the front view before requesting analysis.'])
      return
    }
    if (!product.category) {
      setErrors(['Select a product category before requesting analysis.'])
      return
    }
    setErrors([])
    setServiceError(null)
    setIsSubmitting(true)
    try {
      const response = await requestAnalysis({
        images: images.map(({ file, view }) => ({ file, view })),
        product,
      })
      setResult(response)
    } catch (error) {
      setServiceError(error instanceof AnalysisServiceError ? error.payload.message : 'Analysis could not be completed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <section className="section completed-section">
        <div className="container">
          <button className="text-link back-action" type="button" onClick={() => setResult(null)}>← Back to prepared photos</button>
          <AnalysisResultView result={result} />
        </div>
      </section>
    )
  }

  const ready = images.length > 0 && Boolean(product.category) && images.some((image) => image.view === 'front')

  return (
    <>
      <section className="page-hero page-hero--check">
        <div className="container check-hero-grid">
          <div>
            <p className="eyebrow">Prepare a product check</p>
            <h1>Start with clear, useful evidence.</h1>
            <p>Add one front image and up to three supporting views. The browser validates your files locally before any future model request.</p>
          </div>
          <div className="model-status-card">
            <span className={`status-dot ${service.configured ? '' : 'status-dot--amber'}`} aria-hidden="true" />
            <div>
              <strong>{service.configured ? 'Model service configured' : 'Model not connected'}</strong>
              <p>{service.configured ? 'Prepared images can be sent to the research inference service.' : 'Uploads will not produce a real or simulated prediction.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section upload-section">
        <div className="container upload-layout">
          <div className="upload-main">
            <div className="form-section-heading"><span>01</span><div><h2>Add package photos</h2><p>JPEG, PNG, or WebP · max {formatBytes(maxBytes)} each · up to {MAX_IMAGE_COUNT} images</p></div></div>

            <div
              className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => { if (event.currentTarget === event.target) setIsDragging(false) }}
              onDrop={handleDrop}
            >
              <div className="dropzone-icon"><UploadCloud aria-hidden="true" /></div>
              <h3>{isReading ? 'Checking your images…' : 'Drop product images here'}</h3>
              <p>Start with a straight-on front photo. Add the back and important details next.</p>
              <label className="button button--outline" htmlFor="product-images">
                <Plus size={17} aria-hidden="true" /> Choose images
              </label>
              <input
                id="product-images"
                className="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleInput}
                disabled={images.length >= MAX_IMAGE_COUNT || isReading}
              />
            </div>

            {errors.length > 0 && (
              <div className="form-alert form-alert--error" role="alert">
                <AlertCircle aria-hidden="true" />
                <div><strong>Check these files</strong>{errors.map((error) => <p key={error}>{error}</p>)}</div>
              </div>
            )}

            {images.length > 0 && (
              <div className="preview-section">
                <div className="preview-header"><p>{images.length} of {MAX_IMAGE_COUNT} images added</p><button type="button" className="quiet-button" onClick={clearAll}>Remove all</button></div>
                <div className="preview-grid">
                  {images.map((image) => (
                    <article className="image-preview" key={image.id}>
                      <div className="image-preview__media"><img src={image.previewUrl} alt={`${image.view} view preview of ${image.file.name}`} /></div>
                      <div className="image-preview__body">
                        <label>
                          Image view
                          <select
                            value={image.view}
                            onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, view: event.target.value as ImageView } : item))}
                          >
                            <option value="front">Front</option><option value="back">Back</option><option value="detail">Detail</option>
                          </select>
                        </label>
                        <div className="file-meta"><FileImage size={16} aria-hidden="true" /><span title={image.file.name}>{image.file.name}</span><small>{formatBytes(image.file.size)}</small></div>
                        <div className="preview-actions">
                          <label className="icon-text-button" htmlFor={`replace-${image.id}`}><RefreshCw size={15} aria-hidden="true" /> Replace</label>
                          <input id={`replace-${image.id}`} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void replaceImage(image.id, event.target.files?.[0])} />
                          <button className="icon-text-button icon-text-button--danger" type="button" onClick={() => removeImage(image.id)}><Trash2 size={15} aria-hidden="true" /> Remove</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="form-section-heading form-section-heading--second"><span>02</span><div><h2>Describe the product</h2><p>These details help select the right comparison reference later.</p></div></div>
            <div className="product-form surface-card">
              <label className="field field--wide">Product category <span aria-hidden="true">*</span>
                <select value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })}>
                  <option value="">Select a category</option>
                  {productCategories.map((category) => <option value={category} key={category}>{category}</option>)}
                </select>
              </label>
              <label className="field">Brand <small>Optional</small><input value={product.brand} onChange={(event) => setProduct({ ...product, brand: event.target.value })} placeholder="e.g. brand name" /></label>
              <label className="field">Variant <small>Optional</small><input value={product.variant} onChange={(event) => setProduct({ ...product, variant: event.target.value })} placeholder="e.g. sensitive, rose" /></label>
              <label className="field">Package size <small>Optional</small><input value={product.packageSize} onChange={(event) => setProduct({ ...product, packageSize: event.target.value })} placeholder="e.g. 50 mL" /></label>
            </div>

            <div className={`readiness-card ${ready ? 'readiness-card--ready' : ''}`}>
              <div className="readiness-icon">{ready ? <Check aria-hidden="true" /> : <Info aria-hidden="true" />}</div>
              <div><strong>{ready ? 'Inputs ready for a future analysis request' : 'Complete the required inputs'}</strong><p>{ready ? 'Your photos are prepared locally. Nothing has been transmitted.' : 'Add a front image and choose a product category.'}</p></div>
            </div>

            {serviceError && <div className="form-alert form-alert--error" role="alert"><AlertCircle aria-hidden="true" /><div><strong>Analysis unavailable</strong><p>{serviceError}</p></div></div>}

            <div className="submit-row">
              <button className="button" type="button" disabled={!ready || !service.configured || isSubmitting} onClick={() => void submit()}>
                {isSubmitting ? <><LoaderCircle className="spin" aria-hidden="true" /> Analyzing…</> : <>Request connected analysis <ArrowRight size={18} aria-hidden="true" /></>}
              </button>
              {!service.configured && <p><LockKeyhole size={15} aria-hidden="true" /> Disabled until a backend URL is configured</p>}
            </div>
          </div>

          <aside className="upload-aside">
            <div className="aside-card aside-card--tips">
              <Lightbulb aria-hidden="true" />
              <h2>Photo checklist</h2>
              <ol>
                <li><span>01</span><p><strong>Use soft, even light</strong>Avoid flash and bright reflections on glossy packaging.</p></li>
                <li><span>02</span><p><strong>Keep text readable</strong>Hold the camera steady and tap the label to focus.</p></li>
                <li><span>03</span><p><strong>Fill the frame</strong>Show the whole package without cropping the edges.</p></li>
                <li><span>04</span><p><strong>One product only</strong>Keep unrelated products and clutter out of the photo.</p></li>
              </ol>
            </div>
            <div className="aside-card aside-card--privacy">
              <LockKeyhole aria-hidden="true" />
              <h2>{service.configured ? 'Photos are sent only when requested' : 'Your photos stay local'}</h2>
              <p>{service.configured
                ? 'Previews remain local until you request analysis. The configured service then receives the prepared images and product details.'
                : 'Preview images remain in browser memory. Temporary preview URLs are released when you replace, remove, or leave this session.'}</p>
            </div>
            <a className="aside-demo-link" href="#/demo"><span>Want to see the future result layout?</span><strong>Explore fictional demos →</strong></a>
          </aside>
        </div>
      </section>
    </>
  )
}
