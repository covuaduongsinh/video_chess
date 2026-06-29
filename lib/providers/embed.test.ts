import { describe, expect, it } from 'vitest'
import { extractDriveId, extractYouTubeId, toEmbedUrl, toThumbnailUrl, usesIframe } from './embed'

describe('extractYouTubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=abc123', 'abc123'],
    ['https://youtu.be/xyz789', 'xyz789'],
    ['https://www.youtube.com/embed/qwe456', 'qwe456'],
    ['https://www.youtube.com/shorts/sh0rt', 'sh0rt']
  ])('%s → %s', (url, id) => {
    expect(extractYouTubeId(url)).toBe(id)
  })

  it('URL không phải YouTube → null', () => {
    expect(extractYouTubeId('https://example.com/video')).toBeNull()
  })
})

describe('extractDriveId', () => {
  it('dạng /file/d/<id>/', () => {
    expect(extractDriveId('https://drive.google.com/file/d/FILEID/view')).toBe('FILEID')
  })
  it('dạng ?id=<id>', () => {
    expect(extractDriveId('https://drive.google.com/open?id=ABC')).toBe('ABC')
  })
})

describe('toEmbedUrl', () => {
  it('youtube từ sourceId', () => {
    expect(toEmbedUrl({ provider: 'youtube', sourceId: 'vid' })).toBe('https://www.youtube.com/embed/vid')
  })
  it('youtube suy ra từ sourceUrl', () => {
    expect(toEmbedUrl({ provider: 'youtube', sourceUrl: 'https://youtu.be/abc' })).toBe(
      'https://www.youtube.com/embed/abc'
    )
  })
  it('gdrive từ sourceId', () => {
    expect(toEmbedUrl({ provider: 'gdrive', sourceId: 'g' })).toBe('https://drive.google.com/file/d/g/preview')
  })
  it('cloudflare không có subdomain → fallback videodelivery.net', () => {
    expect(toEmbedUrl({ provider: 'cloudflare', sourceId: 'c' })).toBe('https://iframe.videodelivery.net/c')
  })
  it('other → trả về sourceUrl', () => {
    expect(toEmbedUrl({ provider: 'other', sourceUrl: 'https://x.test/a' })).toBe('https://x.test/a')
  })
  it('bunny thiếu cấu hình → null', () => {
    expect(toEmbedUrl({ provider: 'bunny', sourceId: 'b' })).toBeNull()
  })
})

describe('usesIframe', () => {
  it('iframe cho gdrive/onedrive/youtube', () => {
    expect(usesIframe('youtube')).toBe(true)
    expect(usesIframe('gdrive')).toBe(true)
    expect(usesIframe('onedrive')).toBe(true)
  })
  it('không iframe cho bunny/cloudflare', () => {
    expect(usesIframe('bunny')).toBe(false)
    expect(usesIframe('cloudflare')).toBe(false)
  })
})

describe('toThumbnailUrl', () => {
  it('youtube suy ra thumbnail', () => {
    expect(toThumbnailUrl({ provider: 'youtube', sourceId: 'vid' })).toBe('https://i.ytimg.com/vi/vid/hqdefault.jpg')
  })
  it('ưu tiên thumbnail tuỳ chỉnh nếu có', () => {
    expect(toThumbnailUrl({ provider: 'youtube', sourceId: 'vid', thumbnailUrl: 'https://x/t.jpg' })).toBe(
      'https://x/t.jpg'
    )
  })
})
