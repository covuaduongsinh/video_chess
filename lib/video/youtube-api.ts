/**
 * Tải YouTube IFrame Player API một lần (singleton) và trả về namespace `YT`
 * khi sẵn sàng. YouTube gọi global `onYouTubeIframeAPIReady` sau khi script tải xong.
 *
 * Kiểu khai báo tối giản cho phần API thực sự dùng (tránh phụ thuộc @types/youtube).
 */

export type YTPlayer = {
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  getCurrentTime: () => number
  playVideo: () => void
  pauseVideo: () => void
  destroy: () => void
}

type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId?: string
      playerVars?: Record<string, unknown>
      events?: {
        onReady?: (e: { target: YTPlayer }) => void
        onStateChange?: (e: { data: number; target: YTPlayer }) => void
      }
    }
  ) => YTPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number; CUED: number }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytPromise: Promise<YTNamespace> | null = null

/** Trả promise resolve khi `window.YT` sẵn sàng để tạo Player. */
export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') return Promise.reject(new Error('YouTube API chỉ tải ở client'))
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (ytPromise) return ytPromise

  ytPromise = new Promise<YTNamespace>((resolve) => {
    // Giữ lại callback cũ (nếu có) để không ghi đè người dùng khác.
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT as YTNamespace)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })
  return ytPromise
}
