const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_IMAGE_COUNT = 4

export interface FileValidationOptions {
  maxBytes: number
  existingCount?: number
}

export interface FileValidationResult {
  validFiles: File[]
  errors: string[]
}

export function getMaxFileSizeBytes() {
  const configuredMb = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB)
  const maxMb = Number.isFinite(configuredMb) && configuredMb > 0 ? configuredMb : 8
  return maxMb * 1024 * 1024
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateFiles(files: File[], options: FileValidationOptions): FileValidationResult {
  const errors: string[] = []
  const validFiles: File[] = []
  const existingCount = options.existingCount ?? 0
  const openSlots = Math.max(0, MAX_IMAGE_COUNT - existingCount)

  if (files.length > openSlots) {
    errors.push(`You can add ${openSlots} more image${openSlots === 1 ? '' : 's'} (maximum ${MAX_IMAGE_COUNT}).`)
  }

  files.slice(0, openSlots).forEach((file) => {
    if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
      errors.push(`${file.name}: use a JPEG, PNG, or WebP image.`)
      return
    }
    if (file.size > options.maxBytes) {
      errors.push(`${file.name}: exceeds the ${formatBytes(options.maxBytes)} size limit.`)
      return
    }
    validFiles.push(file)
  })

  return { validFiles, errors }
}

export async function verifyImageReadable(file: File): Promise<boolean> {
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<boolean>((resolve) => {
      const image = new Image()
      image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0)
      image.onerror = () => resolve(false)
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
