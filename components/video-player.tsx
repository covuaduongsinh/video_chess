'use client'

import { extractYouTubeId, type VideoProvider } from '@/lib/providers/embed'
import { NOOP_CONTROLLER, type PlayerController } from '@/lib/video/player'
import { loadYouTubeApi, type YTPlayer } from '@/lib/video/youtube-api'
import { useEffect, useRef } from 'react'

type VideoPlayerProps = {
  title: string
  provider: VideoProvider
  sourceId: string | null
  embedUrl: string | null
  playbackUrl: string | null
  sourceUrl: string | null
  iframe: boolean
  /** Phát ra controller khi player sẵn sàng (để cha tua/đọc thời gian). */
  onReady?: (controller: PlayerController) => void
  /** Bắn thời gian đang phát (giây) định kỳ. */
  onTimeUpdate?: (seconds: number) => void
}

/**
 * Player đa provider, có thể điều khiển từ cha (tua + đọc thời gian):
 * - playbackUrl (HLS .m3u8) -> <video> + hls.js (Bunny/Cloudflare) — điều khiển được.
 * - provider youtube -> YouTube IFrame Player API — điều khiển được (tua/getCurrentTime).
 * - gdrive/onedrive -> <iframe> thường — KHÔNG điều khiển được (NOOP_CONTROLLER).
 * - còn lại -> <video> trực tiếp (mp4...) — điều khiển được.
 */
export function VideoPlayer({
  title,
  provider,
  sourceId,
  embedUrl,
  playbackUrl,
  sourceUrl,
  iframe,
  onReady,
  onTimeUpdate
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const ytWrapperRef = useRef<HTMLDivElement | null>(null)

  // Giữ callback mới nhất trong ref để effect không phụ thuộc identity của chúng.
  const onReadyRef = useRef(onReady)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  onReadyRef.current = onReady
  onTimeUpdateRef.current = onTimeUpdate

  const youtubeId = provider === 'youtube' ? sourceId || extractYouTubeId(sourceUrl ?? '') : null
  const mode: 'hls' | 'youtube' | 'iframe' | 'file' | 'none' = playbackUrl
    ? 'hls'
    : youtubeId
      ? 'youtube'
      : iframe && embedUrl
        ? 'iframe'
        : sourceUrl
          ? 'file'
          : 'none'

  // --- HLS: nạp hls.js (Bunny/Cloudflare) ---
  useEffect(() => {
    if (mode !== 'hls') return
    const video = videoRef.current
    if (!video || !playbackUrl) return

    // Safari hỗ trợ HLS sẵn
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl
      return
    }

    let destroyed = false
    let hls: { destroy: () => void } | null = null
    import('hls.js').then(({ default: Hls }) => {
      if (destroyed) return
      if (Hls.isSupported()) {
        const instance = new Hls()
        instance.loadSource(playbackUrl)
        instance.attachMedia(video)
        hls = instance
      }
    })
    return () => {
      destroyed = true
      hls?.destroy()
    }
  }, [mode, playbackUrl])

  // --- Controller cho thẻ <video> (HLS + mp4 trực tiếp) ---
  useEffect(() => {
    if (mode !== 'hls' && mode !== 'file') return
    const video = videoRef.current
    if (!video) return

    const controller: PlayerController = {
      isControllable: true,
      seek: (s) => {
        video.currentTime = s
      },
      getCurrentTime: () => video.currentTime,
      play: () => {
        void video.play()
      },
      pause: () => video.pause()
    }
    onReadyRef.current?.(controller)

    const onTime = () => onTimeUpdateRef.current?.(video.currentTime)
    video.addEventListener('timeupdate', onTime)
    return () => video.removeEventListener('timeupdate', onTime)
  }, [mode])

  // --- Controller cho YouTube (IFrame Player API) ---
  useEffect(() => {
    if (mode !== 'youtube' || !youtubeId) return
    const wrapper = ytWrapperRef.current
    if (!wrapper) return

    let player: YTPlayer | null = null
    let poll: ReturnType<typeof setInterval> | null = null
    let destroyed = false

    // Tạo node con thủ công để React không quản lý (YT sẽ thay node này bằng iframe).
    const host = document.createElement('div')
    host.className = 'h-full w-full'
    wrapper.appendChild(host)

    loadYouTubeApi().then((YT) => {
      if (destroyed) return
      player = new YT.Player(host, {
        videoId: youtubeId,
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: (e) => {
            const p = e.target
            onReadyRef.current?.({
              isControllable: true,
              seek: (s) => p.seekTo(s, true),
              getCurrentTime: () => p.getCurrentTime(),
              play: () => p.playVideo(),
              pause: () => p.pauseVideo()
            })
          },
          onStateChange: (e) => {
            const playing = window.YT?.PlayerState.PLAYING
            if (e.data === playing) {
              poll ??= setInterval(() => onTimeUpdateRef.current?.(e.target.getCurrentTime()), 250)
            } else if (poll) {
              clearInterval(poll)
              poll = null
            }
          }
        }
      })
    })

    return () => {
      destroyed = true
      if (poll) clearInterval(poll)
      player?.destroy()
      wrapper.innerHTML = ''
    }
  }, [mode, youtubeId])

  // --- Provider không điều khiển được (gdrive/onedrive) hoặc không có nguồn ---
  useEffect(() => {
    if (mode === 'iframe' || mode === 'none') onReadyRef.current?.(NOOP_CONTROLLER)
  }, [mode])

  if (mode === 'hls') {
    return <video ref={videoRef} controls playsInline className='aspect-video w-full rounded-lg bg-black' />
  }

  if (mode === 'youtube') {
    return <div ref={ytWrapperRef} className='aspect-video w-full overflow-hidden rounded-lg bg-black' />
  }

  if (mode === 'iframe') {
    return (
      <iframe
        src={embedUrl!}
        title={title}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
        allowFullScreen
        className='aspect-video w-full rounded-lg bg-black'
      />
    )
  }

  if (mode === 'file') {
    return (
      <video ref={videoRef} controls playsInline src={sourceUrl!} className='aspect-video w-full rounded-lg bg-black' />
    )
  }

  return (
    <div className='bg-secondary text-secondary-foreground flex aspect-video w-full items-center justify-center rounded-lg text-sm'>
      Không có nguồn video.
    </div>
  )
}
