import { AppShell } from '@/components/app-shell'
import { LessonView } from '@/components/learn/lesson-view'
import { toEmbedUrl, toPlaybackUrl, usesIframe, type VideoProvider } from '@/lib/providers/embed'
import { getLessonBySlug } from '@/lib/queries/learning'
import { notFound } from 'next/navigation'

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
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
