export interface CompanyProfile {
  organizationName: string
  organizationType: string
  representativeName: string
  workEmail: string
  website: string
}

export interface ProductReferenceDraft {
  brand: string
  productName: string
  category: string
  variant: string
  packageSize: string
  targetMarket: string
  packagingVersion: string
  notes: string
}

export interface CompanyDraft {
  company: CompanyProfile
  product: ProductReferenceDraft
  imageCount: number
  rightsConfirmed: boolean
}
