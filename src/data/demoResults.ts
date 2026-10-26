import type { AnalysisResponse } from '../types/analysis'

export type DemoResult = AnalysisResponse & {
  demoTitle: string
  demoProduct: string
}

export const demoResults: DemoResult[] = [
  {
    demoTitle: 'Consistent packaging signals',
    demoProduct: 'Fictional: Luma Dew Hydrating Cream',
    requestId: 'demo-likely-genuine',
    outcome: 'likely-genuine',
    summary: 'The available image and packaging-text evidence is broadly consistent with the fictional reference.',
    reasons: [
      'Front label layout and key visual regions align with the demo reference.',
      'Product name, volume, and ingredient text are consistent across the supplied views.',
      'No high-priority field mismatches were found in this fictional example.',
    ],
    suggestedNextSteps: [
      'Compare the batch code with the manufacturer’s official support channel.',
      'Consider seller history and purchase source alongside this screening result.',
    ],
    imageQuality: [
      { imageId: 'demo-front', view: 'front', usable: true, issues: [] },
      { imageId: 'demo-back', view: 'back', usable: true, issues: ['Minor glare near the lower edge'] },
    ],
    imageModel: { label: 'Packaging visually consistent', notes: ['No image score is shown in this fixture.'] },
    extractedText: [
      { text: 'LUMA DEW • HYDRATING CREAM • 50 mL', confidence: 0.96, sourceView: 'front' },
      { text: 'Apply to cleansed skin morning and evening', confidence: 0.9, sourceView: 'back' },
    ],
    referenceMatch: { referenceName: 'Demo global package — 2026', market: 'Demo market', packagingVersion: 'v2', textSimilarity: 0.92 },
    fieldMismatches: [],
    missingInformation: ['Batch-code verification'],
    modelVersion: 'demo-fixture-1.0',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    demoTitle: 'Several details need review',
    demoProduct: 'Fictional: Verdant Coil Repair Shampoo',
    requestId: 'demo-suspicious',
    outcome: 'suspicious-packaging',
    summary: 'Multiple packaging details differ from the selected fictional reference and warrant closer review.',
    reasons: [
      'The net-volume format differs from the reference package.',
      'A required distributor line was not detected in the supplied back image.',
      'The seal illustration has a different proportion from the fictional reference.',
    ],
    suggestedNextSteps: [
      'Check whether the package was produced for a different market.',
      'Ask the manufacturer to review clear photos and the batch code.',
      'Avoid relying on this screening result as proof of safety or authenticity.',
    ],
    imageQuality: [
      { imageId: 'demo-front', view: 'front', usable: true, issues: [] },
      { imageId: 'demo-back', view: 'back', usable: true, issues: ['Small text is slightly soft'] },
    ],
    imageModel: { label: 'Visual inconsistencies detected', notes: ['Seal geometry differs from the reference region.'] },
    extractedText: [
      { text: 'VERDANT COIL • REPAIR SHAMPOO', confidence: 0.94, sourceView: 'front' },
      { text: 'Net 490 ml', confidence: 0.82, sourceView: 'back' },
    ],
    referenceMatch: { referenceName: 'Demo regional package — 2026', market: 'Demo market', packagingVersion: 'v1', textSimilarity: 0.68 },
    fieldMismatches: [
      { field: 'Package size', observed: '490 ml', expected: '500 mL', severity: 'warning' },
      { field: 'Distributor line', observed: 'Not detected', expected: 'Present on reference', severity: 'critical' },
    ],
    missingInformation: ['Readable batch code'],
    modelVersion: 'demo-fixture-1.0',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    demoTitle: 'Not enough usable evidence',
    demoProduct: 'Fictional: Arc & Iris Eau de Parfum',
    requestId: 'demo-insufficient',
    outcome: 'insufficient-evidence',
    summary: 'The available photos do not contain enough clear packaging evidence for a meaningful comparison.',
    reasons: [
      'Strong reflections obscure the product name and emblem.',
      'No back or detail image was provided for packaging-text comparison.',
      'The selected reference cannot be confirmed from the visible information.',
    ],
    suggestedNextSteps: [
      'Retake the front image in diffuse light without flash.',
      'Add a straight-on back image with the small print in focus.',
      'Include the box and bottle together when both belong to the same product.',
    ],
    imageQuality: [
      { imageId: 'demo-front', view: 'front', usable: false, issues: ['Strong glare', 'Product cropped', 'Text unreadable'] },
    ],
    extractedText: [{ text: 'ARC ... IR...', confidence: 0.31, sourceView: 'front' }],
    fieldMismatches: [],
    missingInformation: ['Back label', 'Package size', 'Batch code', 'Market or purchase region'],
    modelVersion: 'demo-fixture-1.0',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]
