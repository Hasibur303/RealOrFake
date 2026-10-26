import { describe, expect, it } from 'vitest'
import { demoResults } from '../data/demoResults'
import { getServiceAvailability, isAnalysisResponse, requestAnalysis } from './analysisService'

describe('analysis response state handling', () => {
  it('accepts a complete response fixture', () => {
    expect(isAnalysisResponse(demoResults[0])).toBe(true)
  })

  it('rejects incomplete responses rather than inventing missing fields', () => {
    expect(isAnalysisResponse({ requestId: 'partial', outcome: 'likely-genuine' })).toBe(false)
  })

  it('keeps the default upload flow unavailable when no backend is configured', async () => {
    expect(getServiceAvailability().configured).toBe(false)
    await expect(requestAnalysis({ images: [], product: { category: 'Skincare' } })).rejects.toMatchObject({
      payload: expect.objectContaining({ code: 'SERVICE_UNAVAILABLE' }),
    })
  })
})
