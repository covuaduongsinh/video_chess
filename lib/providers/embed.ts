/**
 * Lớp trừu tượng provider-agnostic cho video.
 * Cho một video (provider + source_id/source_url), suy ra URL nhúng (iframe),
 * URL phát HLS (nếu có) và URL thumbnail. Thêm provider mới = thêm 1 case.
 */

export type VideoProvider = 'bunny' | 'cloudflare' | 'gdrive' | 'onedrive' | 'youtube' | 'other'

export type VideoSource = {
  provider: VideoProvider
  sourceId?: string | null
  sourceUrl?: string | null
  playbackUrl?: string | null
  thumbnailUrl?: string | null
}

// Cấu hình CDN cho provider chuyên dụng (đặt ở biến môi trường, có thể để trống lúc đầu).
const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID ?? ''
const BUNNY_CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME ?? '' // vd: vz-xxxx.b-cdn.net
const CLOUDFLARE_SUBDOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN ?? '' // vd: customer-xxxx.cloudflarestream.com

/** URL để nhúng trong <iframe>. */
export function toEmbedUrl(source: VideoSource): string | null {
  const { provider, sourceId, sourceUrl } = source
  switch (provider) {
    case 'bunny':
      if (!sourceId || !BUNNY_LIBRARY_ID) return null
      return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${sourceId}`
    case 'cloudflare':
      if (!sourceId) return null
      return CLOUDFLARE_SUBDOMAIN
        ? `https://${CLOUDFLARE_SUBDOMAIN}/${sourceId}/iframe`
        : `https://iframe.videodelivery.net/${sourceId}`
    case 'gdrive': {
      const id = sourceId || extractDriveId(sourceUrl ?? '')
      return id ? `https://drive.google.com/file/d/${id}/preview` : null
    }
    case 'onedrive':
      // OneDrive: dán trực tiếp embed URL từ tính năng "Embed" của OneDrive.
      return sourceUrl || null
    case 'youtube': {
      const id = sourceId || extractYouTubeId(sourceUrl ?? '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    case 'other':
      return sourceUrl || null
    default:
      return null
  }
}

/** URL phát HLS (.m3u8) nếu provider hỗ trợ — dùng cho player hls.js. */
export function toPlaybackUrl(source: VideoSource): string | null {
  if (source.playbackUrl) return source.playbackUrl
  const { provider, sourceId } = source
  switch (provider) {
    case 'bunny':
      return sourceId && BUNNY_CDN_HOSTNAME
        ? `https://${BUNNY_CDN_HOSTNAME}/${sourceId}/playlist.m3u8`
        : null
    case 'cloudflare':
      return sourceId && CLOUDFLARE_SUBDOMAIN
        ? `https://${CLOUDFLARE_SUBDOMAIN}/${sourceId}/manifest/video.m3u8`
        : null
    default:
      return null
  }
}

/** URL thumbnail; suy ra từ provider nếu chưa có thumbnail tuỳ chỉnh. */
export function toThumbnailUrl(source: VideoSource): string | null {
  if (source.thumbnailUrl) return source.thumbnailUrl
  const { provider, sourceId, sourceUrl } = source
  switch (provider) {
    case 'bunny':
      return sourceId && BUNNY_CDN_HOSTNAME ? `https://${BUNNY_CDN_HOSTNAME}/${sourceId}/thumbnail.jpg` : null
    case 'cloudflare':
      return sourceId && CLOUDFLARE_SUBDOMAIN
        ? `https://${CLOUDFLARE_SUBDOMAIN}/${sourceId}/thumbnails/thumbnail.jpg`
        : null
    case 'gdrive': {
      const id = sourceId || extractDriveId(sourceUrl ?? '')
      return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1280` : null
    }
    case 'youtube': {
      const id = sourceId || extractYouTubeId(sourceUrl ?? '')
      return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
    }
    default:
      return null
  }
}

/** Provider dùng <iframe> (true) hay player HLS/<video> (false)? */
export function usesIframe(provider: VideoProvider): boolean {
  return provider === 'gdrive' || provider === 'onedrive' || provider === 'youtube'
}

// --- Parsers ---------------------------------------------------------------

/** Tách fileId từ link Google Drive (.../file/d/<id>/... hoặc ?id=<id>). */
export function extractDriveId(url: string): string | null {
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/)
  return m ? m[1] : null
}

/** Tách videoId từ link YouTube (watch?v=, youtu.be/, /embed/, /shorts/). */
export function extractYouTubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?]+)/) ||
    url.match(/\/embed\/([^?]+)/) ||
    url.match(/\/shorts\/([^?]+)/)
  return m ? m[1] : null
}
