export type CompanyReferenceStatus = 'draft' | 'ready-review' | 'changes-needed'

export interface CompanyReferenceFixture {
  id: string
  brand: string
  productName: string
  category: string
  market: string
  version: string
  status: CompanyReferenceStatus
  viewsReady: number
  viewsExpected: number
  updatedLabel: string
  notes: string[]
}

export const companyReferenceFixtures: CompanyReferenceFixture[] = [
  {
    id: 'RF-DEMO-104',
    brand: 'Luma Dew',
    productName: 'Hydrating Cream',
    category: 'Skincare',
    market: 'Bangladesh',
    version: '2026 carton',
    status: 'ready-review',
    viewsReady: 4,
    viewsExpected: 4,
    updatedLabel: 'Sample date · 24 Oct 2026',
    notes: ['Front, back, side, and batch-code views included.', 'Organization review would be required before submission.'],
  },
  {
    id: 'RF-DEMO-103',
    brand: 'Verdant Coil',
    productName: 'Repair Shampoo',
    category: 'Haircare',
    market: 'South Asia',
    version: 'Version 2 bottle',
    status: 'changes-needed',
    viewsReady: 3,
    viewsExpected: 4,
    updatedLabel: 'Sample date · 22 Oct 2026',
    notes: ['Add a readable barcode or batch-code detail.', 'Confirm whether the distributor line differs by market.'],
  },
  {
    id: 'RF-DEMO-102',
    brand: 'Arc & Iris',
    productName: 'Eau de Parfum',
    category: 'Fragrance',
    market: 'Global demo market',
    version: 'Launch packaging',
    status: 'draft',
    viewsReady: 2,
    viewsExpected: 4,
    updatedLabel: 'Sample date · 18 Oct 2026',
    notes: ['Back label and bottom-code views are still missing.', 'Market scope needs clarification.'],
  },
  {
    id: 'RF-DEMO-101',
    brand: 'Morrow Mint',
    productName: 'Daily Toothpaste',
    category: 'Oral care',
    market: 'Bangladesh',
    version: '2025 tube and carton',
    status: 'draft',
    viewsReady: 1,
    viewsExpected: 4,
    updatedLabel: 'Sample date · 12 Oct 2026',
    notes: ['Only a front view is included.', 'Add carton and tube details as separate views.'],
  },
]

export function filterCompanyReferences(
  references: CompanyReferenceFixture[],
  query: string,
  status: CompanyReferenceStatus | 'all',
) {
  const normalizedQuery = query.trim().toLowerCase()
  return references.filter((reference) => {
    const matchesStatus = status === 'all' || reference.status === status
    const matchesQuery = !normalizedQuery || [
      reference.brand,
      reference.productName,
      reference.category,
      reference.market,
      reference.version,
      reference.id,
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
    return matchesStatus && matchesQuery
  })
}
