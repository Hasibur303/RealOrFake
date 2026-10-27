import type { CompanyProfile, ProductReferenceDraft } from '../types/company'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCompanyProfile(profile: CompanyProfile) {
  const errors: string[] = []
  if (!profile.organizationName.trim()) errors.push('Enter the organization name.')
  if (!profile.organizationType) errors.push('Choose the organization type.')
  if (!profile.representativeName.trim()) errors.push('Enter a representative name.')
  if (!profile.workEmail.trim()) errors.push('Enter a work email address.')
  else if (!emailPattern.test(profile.workEmail)) errors.push('Enter a valid work email address.')
  return errors
}

export function validateProductReference(product: ProductReferenceDraft) {
  const errors: string[] = []
  if (!product.brand.trim()) errors.push('Enter the brand name.')
  if (!product.productName.trim()) errors.push('Enter the product name.')
  if (!product.category) errors.push('Choose a product category.')
  if (!product.targetMarket.trim()) errors.push('Enter the intended market or region.')
  if (!product.packagingVersion.trim()) errors.push('Identify the packaging version or release period.')
  return errors
}

export function getCompanyDraftReadiness(
  profile: CompanyProfile,
  product: ProductReferenceDraft,
  imageCount: number,
  rightsConfirmed: boolean,
) {
  const companyErrors = validateCompanyProfile(profile)
  const productErrors = validateProductReference(product)
  const imageErrors = imageCount > 0 ? [] : ['Add at least one reference package image.']
  const rightsErrors = rightsConfirmed ? [] : ['Confirm that the organization may provide these reference materials.']
  return {
    complete: companyErrors.length + productErrors.length + imageErrors.length + rightsErrors.length === 0,
    companyErrors,
    productErrors,
    imageErrors,
    rightsErrors,
  }
}
