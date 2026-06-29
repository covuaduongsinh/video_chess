import { AppShell } from '@/components/app-shell'
import { LessonView } from '@/components/learn/lesson-view'
import { toEmbedUrl, toPlaybackUrl, usesIframe, type VideoProvider } from '@/lib/providers/embed'
import { getLessonBySlug } from '@/lib/queries/learning'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lesson = await getLessonBySlug(slug)
  if (!lesson) return {}

  return {
    title: lesson.title,
    description: lesson.description?.slice(0, 160) ?? `Bài học cờ vua: ${lesson.title}`,
    openGraph: {
      title: lesson.title,
      description: lesson.description?.slice(0, 160) ?? undefined
    }
  }
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params
  const lesson = await getLessonBySlug(slug)
  if (!lesson) notFound()


  const v = lesson.video
  const player = v
    ? (() => {
        const source = {
          provider: v.provider as VideoProvider,
          sourceId: v.sourceId,
          sourceUrl: v.sourceUrl,
          playbackUrl: v.playbackUrl
        }
        return {
          provider: source.provider,
          sourceId: v.sourceId,
          embedUrl: toEmbedUrl(source),
          playbackUrl: toPlaybackUrl(source),
          sourceUrl: v.sourceUrl,
          iframe: usesIframe(source.provider)
        }
      })()
    : null

  return (
    <AppShell>
      <LessonView
        title={lesson.title}
        description={lesson.description}
        player={player}
        chapters={lesson.chapters}
        drills={lesson.drills}
      />
    </AppShell>
  )
}
