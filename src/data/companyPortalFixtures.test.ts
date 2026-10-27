import { describe, expect, it } from 'vitest'
import { companyReferenceFixtures, filterCompanyReferences } from './companyPortalFixtures'

describe('company portal reference filters', () => {
  it('searches across product, market, and reference id', () => {
    expect(filterCompanyReferences(companyReferenceFixtures, 'toothpaste', 'all')).toHaveLength(1)
    expect(filterCompanyReferences(companyReferenceFixtures, 'Bangladesh', 'all')).toHaveLength(2)
    expect(filterCompanyReferences(companyReferenceFixtures, 'RF-DEMO-103', 'all')[0]?.brand).toBe('Verdant Coil')
  })

  it('filters by preparation status', () => {
    expect(filterCompanyReferences(companyReferenceFixtures, '', 'draft')).toHaveLength(2)
    expect(filterCompanyReferences(companyReferenceFixtures, '', 'ready-review')).toHaveLength(1)
  })

  it('returns an empty state when nothing matches', () => {
    expect(filterCompanyReferences(companyReferenceFixtures, 'not-a-product', 'all')).toEqual([])
  })
})
