import { describe, expect, it } from 'vitest'
import { formatBytes, MAX_IMAGE_COUNT, validateFiles } from './fileValidation'

function imageFile(name: string, type = 'image/png', size = 128) {
  return new File([new Uint8Array(size)], name, { type })
}

describe('validateFiles', () => {
  it('accepts supported image formats within the size limit', () => {
    const files = [imageFile('front.jpg', 'image/jpeg'), imageFile('back.webp', 'image/webp')]
    const result = validateFiles(files, { maxBytes: 1024 })
    expect(result.validFiles).toEqual(files)
    expect(result.errors).toEqual([])
  })

  it('rejects unsupported file formats', () => {
    const result = validateFiles([imageFile('label.gif', 'image/gif')], { maxBytes: 1024 })
    expect(result.validFiles).toHaveLength(0)
    expect(result.errors[0]).toContain('JPEG, PNG, or WebP')
  })

  it('rejects images over the configured limit', () => {
    const result = validateFiles([imageFile('large.png', 'image/png', 2048)], { maxBytes: 1024 })
    expect(result.validFiles).toHaveLength(0)
    expect(result.errors[0]).toContain('size limit')
  })

  it('enforces the total upload count', () => {
    const files = [imageFile('one.png'), imageFile('two.png')]
    const result = validateFiles(files, { maxBytes: 1024, existingCount: MAX_IMAGE_COUNT - 1 })
    expect(result.validFiles).toHaveLength(1)
    expect(result.errors[0]).toContain('maximum 4')
  })
})

describe('formatBytes', () => {
  it('formats file sizes for the upload interface', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB')
  })
})
