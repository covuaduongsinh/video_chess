import { AppSidebar } from '@/components/app-sidebar'
import { PageHeader } from '@/components/page-header'
import { VideoGridItem } from '@/components/video-grid-item'
import { VideoPlayer } from '@/components/video-player'
import { ViewCounter } from '@/components/view-counter'
import { toEmbedUrl, toPlaybackUrl, usesIframe, type VideoProvider } from '@/lib/providers/embed'
import { getRelatedVideos, getVideoById } from '@/lib/queries/videos'
import { postedAgo, viewCount } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function WatchPage({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams
  if (!v) notFound()

  const video = await getVideoById(v)
  if (!video) notFound()

  const source = {
    provider: video.provider as VideoProvider,
    sourceId: video.sourceId,
    sourceUrl: video.sourceUrl,
    playbackUrl: video.playbackUrl
  }
  const embedUrl = toEmbedUrl(source)
  const playbackUrl = toPlaybackUrl(source)
  const related = await getRelatedVideos(video.id)

  return (
    <div className='flex max-h-screen flex-col'>
      <PageHeader />
      <div className='grid grid-flow-col overflow-auto'>
        <AppSidebar />
        <div className='grid grid-cols-1 gap-6 overflow-x-hidden px-4 pb-8 lg:grid-cols-[1fr_320px]'>
          <div className='flex flex-col gap-3'>
            <ViewCounter videoId={video.id} />
            <VideoPlayer
              title={video.title}
              embedUrl={embedUrl}
              playbackUrl={playbackUrl}
              sourceUrl={video.sourceUrl}
              iframe={usesIframe(source.provider)}
            />
            <h1 className='text-lg font-bold'>{video.title}</h1>
            <div className='flex items-center gap-3'>
              {video.channel && (
                <Link href={`/channel/${video.channel.slug}`} className='flex items-center gap-2'>
                  {video.channel.avatarUrl && (
                    <Image
                      src={video.channel.avatarUrl}
                      alt={video.channel.name}
                      width={40}
                      height={40}
                      className='h-10 w-10 rounded-full'
                    />
                  )}
                  <span className='font-semibold'>{video.channel.name}</span>
                </Link>
              )}
              <span className='text-secondary-foreground text-sm'>
                {viewCount(video.views)} Views
                {video.publishedAt ? ` • ${postedAgo(new Date(video.publishedAt))}` : ''}
              </span>
            </div>
            {video.description && (
              <p className='bg-secondary/50 rounded-lg p-3 text-sm whitespace-pre-wrap'>{video.description}</p>
            )}
          </div>

          <aside className='flex flex-col gap-3'>
            <h2 className='text-sm font-bold'>Video liên quan</h2>
            {related.map((r) => (
              <VideoGridItem key={r.id} {...r} />
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}
