import { AppSidebar } from '@/components/app-sidebar'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { VideoGridItem } from '@/components/video-grid-item'
import { VideoPlayer } from '@/components/video-player'
import { ViewCounter } from '@/components/view-counter'
import { toEmbedUrl, toPlaybackUrl, usesIframe, type VideoProvider } from '@/lib/providers/embed'
import { getLessonByVideoId } from '@/lib/queries/learning'
import { getRelatedVideos, getVideoById } from '@/lib/queries/videos'
import { postedAgo, viewCount } from '@/lib/utils'
import { GraduationCap } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { searchParams: Promise<{ v?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { v } = await searchParams
  if (!v) return {}
  const video = await getVideoById(v)
  if (!video) return {}

  const desc = video.description?.slice(0, 160) ?? `Xem video cờ vua: ${video.title}`
  return {
    title: video.title,
    description: desc,
    openGraph: {
      title: video.title,
      description: desc,
      ...(video.thumbnailUrl ? { images: [{ url: video.thumbnailUrl, width: 1280, height: 720 }] } : {})
    }
  }
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao'
}

export default async function WatchPage({ searchParams }: Props) {
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
  const [related, lesson] = await Promise.all([
    getRelatedVideos(video.id, { categoryId: video.categoryId, channelId: video.channelId }),
    getLessonByVideoId(video.id)
  ])

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
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-lg font-bold'>{video.title}</h1>
              {video.category && (
                <Badge asChild variant='secondary'>
                  <Link href={`/?category=${video.category.slug}`}>{video.category.name}</Link>
                </Badge>
              )}
            </div>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              {video.channel && (
                <Link
                  href={`/channel/${video.channel.slug}`}
                  className='hover:bg-secondary/60 flex items-center gap-3 rounded-full border px-3 py-1.5 transition-colors'
                >
                  {video.channel.avatarUrl && (
                    <Image
                      src={video.channel.avatarUrl}
                      alt={video.channel.name}
                      width={40}
                      height={40}
                      className='h-10 w-10 rounded-full'
                    />
                  )}
                  <span className='flex flex-col leading-tight'>
                    <span className='font-semibold'>{video.channel.name}</span>
                    <span className='text-secondary-foreground text-xs'>Xem kênh</span>
                  </span>
                </Link>
              )}
              <span className='text-secondary-foreground text-sm'>
                {viewCount(video.views)} lượt xem
                {video.publishedAt ? ` • ${postedAgo(new Date(video.publishedAt))}` : ''}
              </span>
            </div>
            {lesson && (
              <Link
                href={`/learn/${lesson.slug}`}
                className='bg-primary/10 hover:bg-primary/15 flex items-center gap-3 rounded-lg border p-3 transition-colors'
              >
                <GraduationCap className='text-primary h-8 w-8 shrink-0' />
                <div className='flex flex-col'>
                  <span className='text-secondary-foreground text-xs'>Bài học liên quan</span>
                  <span className='font-semibold'>{lesson.title}</span>
                  <span className='text-secondary-foreground text-xs'>
                    {DIFFICULTY_LABELS[lesson.difficulty] ?? lesson.difficulty} • Vào học →
                  </span>
                </div>
              </Link>
            )}
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
