import { SyncStudio } from '@/components/admin/sync-studio'
import { getChapterForSync } from '@/lib/queries/learning'
import { toEmbedUrl, toPlaybackUrl, usesIframe, type VideoProvider } from '@/lib/providers/embed'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string; chapterId: string }> }

export default async function SyncStudioPage({ params }: Props) {
  const { id, chapterId } = await params
  const chapter = await getChapterForSync(chapterId)
  if (!chapter || chapter.lessonId !== id) notFound()

  const v = chapter.video
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
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <Link href={`/admin/lessons/${id}`} className='text-muted-foreground text-sm underline'>
          ← Sửa bài học
        </Link>
        <h1 className='text-2xl font-bold'>Studio đồng bộ {chapter.title ? `— ${chapter.title}` : ''}</h1>
      </div>

      <SyncStudio
        chapterId={chapter.id}
        lessonId={id}
        pgn={chapter.pgn}
        initialCues={chapter.moveCues}
        player={player}
        title={chapter.title ?? 'Chương'}
      />
    </div>
  )
}
