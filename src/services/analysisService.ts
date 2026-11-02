import {
  AnalysisServiceError,
  type AnalysisErrorCode,
  type AnalysisErrorPayload,
  type AnalysisRequest,
  type AnalysisResponse,
  type ScreeningOutcome,
} from '../types/analysis'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 45_000
const errorCodes: AnalysisErrorCode[] = [
  'SERVICE_UNAVAILABLE',
  'TIMEOUT',
  'REJECTED_FILE',
  'UNSUPPORTED_PRODUCT',
  'INCOMPLETE_RESPONSE',
  'NETWORK_ERROR',
]

function isAnalysisErrorPayload(value: unknown): value is AnalysisErrorPayload {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AnalysisErrorPayload>
  return Boolean(
    candidate.code &&
      errorCodes.includes(candidate.code) &&
      candidate.message &&
      typeof candidate.retryable === 'boolean' &&
      (candidate.details === undefined || Array.isArray(candidate.details)),
  )
}

export function isAnalysisResponse(value: unknown): value is AnalysisResponse {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AnalysisResponse>
  const validOutcomes: ScreeningOutcome[] = [
    'likely-genuine',
    'suspicious-packaging',
    'insufficient-evidence',
    'unsupported-product',
  ]

  return Boolean(
    candidate.requestId &&
      candidate.outcome &&
      validOutcomes.includes(candidate.outcome) &&
      candidate.summary &&
      Array.isArray(candidate.reasons) &&
      Array.isArray(candidate.suggestedNextSteps) &&
      Array.isArray(candidate.imageQuality) &&
      Array.isArray(candidate.extractedText) &&
      Array.isArray(candidate.fieldMismatches) &&
      Array.isArray(candidate.missingInformation),
  )
}

export function getServiceAvailability() {
  return {
    configured: Boolean(API_BASE_URL),
    baseUrl: API_BASE_URL,
  }
}

export async function requestAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
  if (!API_BASE_URL) {
    throw new AnalysisServiceError({
      code: 'SERVICE_UNAVAILABLE',
      message: 'The analysis model is not connected yet.',
      details: ['Your selected photos remain only in this browser session.'],
      retryable: false,
    })
  }

  const formData = new FormData()
  formData.append('product', JSON.stringify(request.product))
  request.images.forEach(({ file }) => formData.append('images', file, file.name))
  formData.append('imageViews', JSON.stringify(request.images.map(({ view }) => view)))

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/v1/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })

    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null)
      if (isAnalysisErrorPayload(payload)) throw new AnalysisServiceError(payload)
      const code = response.status === 422 || response.status === 413 ? 'REJECTED_FILE' : 'SERVICE_UNAVAILABLE'
      throw new AnalysisServiceError({
        code,
        message: code === 'REJECTED_FILE' ? 'The service rejected one or more inputs.' : 'The analysis service is unavailable.',
        retryable: response.status >= 500,
      })
    }

    const payload: unknown = await response.json()
    if (!isAnalysisResponse(payload)) {
      throw new AnalysisServiceError({
        code: 'INCOMPLETE_RESPONSE',
        message: 'The service returned an incomplete response.',
        retryable: true,
      })
    }

    return payload
  } catch (error) {
    if (error instanceof AnalysisServiceError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AnalysisServiceError({ code: 'TIMEOUT', message: 'The request timed out.', retryable: true })
    }
    throw new AnalysisServiceError({
      code: 'NETWORK_ERROR',
      message: 'The browser could not reach the analysis service.',
      retryable: true,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }
}
