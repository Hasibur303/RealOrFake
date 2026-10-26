export type ScreeningOutcome =
  | 'likely-genuine'
  | 'suspicious-packaging'
  | 'insufficient-evidence'
  | 'unsupported-product'

export type ImageView = 'front' | 'back' | 'detail'

export interface ProductDetails {
  category: string
  brand?: string
  variant?: string
  packageSize?: string
}

export interface AnalysisImageInput {
  file: File
  view: ImageView
}

export interface AnalysisRequest {
  images: AnalysisImageInput[]
  product: ProductDetails
}

export interface ImageQualityResult {
  imageId: string
  view: ImageView
  usable: boolean
  issues: string[]
}

export interface ImageModelOutput {
  label?: string
  score?: number
  notes?: string[]
}

export interface OcrTextBlock {
  text: string
  confidence?: number
  sourceView?: ImageView
}

export interface FieldMismatch {
  field: string
  observed?: string
  expected?: string
  severity: 'note' | 'warning' | 'critical'
}

export interface ReferenceMatch {
  referenceName?: string
  market?: string
  packagingVersion?: string
  textSimilarity?: number
}

export interface AnalysisResponse {
  requestId: string
  outcome: ScreeningOutcome
  summary: string
  reasons: string[]
  suggestedNextSteps: string[]
  imageQuality: ImageQualityResult[]
  imageModel?: ImageModelOutput
  extractedText: OcrTextBlock[]
  referenceMatch?: ReferenceMatch
  fieldMismatches: FieldMismatch[]
  missingInformation: string[]
  modelVersion?: string
  createdAt: string
}

export type AnalysisErrorCode =
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'REJECTED_FILE'
  | 'UNSUPPORTED_PRODUCT'
  | 'INCOMPLETE_RESPONSE'
  | 'NETWORK_ERROR'

export interface AnalysisErrorPayload {
  code: AnalysisErrorCode
  message: string
  details?: string[]
  retryable: boolean
}

export class AnalysisServiceError extends Error {
  constructor(public payload: AnalysisErrorPayload) {
    super(payload.message)
    this.name = 'AnalysisServiceError'
  }
}
