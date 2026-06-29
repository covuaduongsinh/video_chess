'use client'

import { useEffect, useRef } from 'react'

type VideoPlayerProps = {
  title: string
  embedUrl: string | null
  playbackUrl: string | null
  sourceUrl: string | null
  iframe: boolean
}

/**
 * Player đa provider:
 * - playbackUrl (HLS .m3u8) -> dùng hls.js (Bunny/Cloudflare).
 * - iframe=true -> nhúng <iframe> (Drive/OneDrive/YouTube).
 * - còn lại -> <video> trực tiếp (mp4...).
 */
export function VideoPlayer({ title, embedUrl, playbackUrl, sourceUrl, iframe }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
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
  }, [playbackUrl])

  if (playbackUrl) {
    return (
      <video ref={videoRef} controls playsInline className='aspect-video w-full rounded-lg bg-black' />
    )
  }

  if (iframe && embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen'
        allowFullScreen
        className='aspect-video w-full rounded-lg bg-black'
      />
    )
  }

  if (sourceUrl) {
    return (
      <video controls playsInline src={sourceUrl} className='aspect-video w-full rounded-lg bg-black' />
    )
  }

  return (
    <div className='bg-secondary text-secondary-foreground flex aspect-video w-full items-center justify-center rounded-lg text-sm'>
      Không có nguồn video.
    </div>
  )
}
