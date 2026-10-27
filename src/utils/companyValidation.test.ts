import { describe, expect, it } from 'vitest'
import type { CompanyProfile, ProductReferenceDraft } from '../types/company'
import { getCompanyDraftReadiness, validateCompanyProfile, validateProductReference } from './companyValidation'

const validCompany: CompanyProfile = {
  organizationName: 'Example Cosmetics',
  organizationType: 'Brand owner',
  representativeName: 'Alex Example',
  workEmail: 'alex@example.com',
  website: 'https://example.com',
}

const validProduct: ProductReferenceDraft = {
  brand: 'Example',
  productName: 'Daily Cream',
  category: 'Skincare',
  variant: 'Original',
  packageSize: '50 mL',
  targetMarket: 'Bangladesh',
  packagingVersion: '2026 carton',
  notes: '',
}

describe('company draft validation', () => {
  it('accepts a complete company profile', () => {
    expect(validateCompanyProfile(validCompany)).toEqual([])
  })

  it('explains invalid company fields clearly', () => {
    expect(validateCompanyProfile({ ...validCompany, workEmail: 'invalid' })).toContain('Enter a valid work email address.')
  })

  it('requires product identity and market details', () => {
    const errors = validateProductReference({ ...validProduct, productName: '', targetMarket: '' })
    expect(errors).toContain('Enter the product name.')
    expect(errors).toContain('Enter the intended market or region.')
  })

  it('only marks a draft ready when fields, images, and rights confirmation are complete', () => {
    expect(getCompanyDraftReadiness(validCompany, validProduct, 2, true).complete).toBe(true)
    expect(getCompanyDraftReadiness(validCompany, validProduct, 0, false).complete).toBe(false)
  })
})
