export const researchConfig = {
  projectTitle: 'A Multimodal Approach to Product Legitimacy Analysis in the Cosmetics Industry',
  applicationName: 'RealOrFake',
  status: 'Prototype interface — model integration is pending',
  methods: {
    imageModel: 'ResNet50',
    textExtraction: 'EasyOCR',
    textComparison: 'Sentence-BERT',
  },
  limitations: [
    'Packaging can differ across markets, manufacturing dates, and legitimate redesigns.',
    'A screening result is not proof of authenticity, product safety, or regulatory compliance.',
    'Final evaluation details will be added after the research models and dataset are verified.',
  ],
} as const

export const productCategories = [
  'Skincare',
  'Haircare',
  'Makeup',
  'Fragrance',
  'Nail products',
  'Oral care',
] as const
