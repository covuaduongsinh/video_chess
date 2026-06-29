import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { getPublishedLessons } from '@/lib/queries/learning'
import { Brain, Map } from 'lucide-react'
import Link from 'next/link'

type Props = { searchParams: Promise<{ level?: string }> }

const DIFF: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao'
}

const LEVEL_LABEL: Record<string, string> = {
  tot: '♟ Tốt',
  ma: '♞ Mã',
  tuong: '♝ Tượng',
  xe: '♜ Xe',
  hau: '♛ Hậu',
  vua: '♚ Vua'
}

export default async function LearnPage({ searchParams }: Props) {
  const { level } = await searchParams
  const lessons = await getPublishedLessons(level)

  return (
    <AppShell>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold'>
          Học qua video + cờ
          {level && LEVEL_LABEL[level] ? <span className='text-muted-foreground ml-2 text-base font-normal'>— {LEVEL_LABEL[level]}</span> : null}
        </h1>
        <div className='flex gap-2'>
          <Button asChild variant='outline'>
            <Link href='/learn/roadmap'>
              <Map className='mr-2 size-4' />
              Lộ trình 6 cấp
            </Link>
          </Button>
          <Button asChild>
            <Link href='/learn/review'>
              <Brain className='mr-2 size-4' />
              Ôn tập SRS
            </Link>
          </Button>
        </div>
      </div>

      {level && (
        <Link href='/learn' className='text-primary mb-4 block text-sm underline'>
          ← Tất cả bài học
        </Link>
      )}

      {lessons.length === 0 ? (
        <p className='text-secondary-foreground'>Chưa có bài học nào{level ? ' ở cấp này' : ''}.</p>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {lessons.map((l) => (
            <Link
              key={l.id}
              href={`/learn/${l.slug}`}
              className='border-border hover:bg-accent/40 flex flex-col gap-2 rounded-lg border p-4'
            >
              <div className='flex items-center gap-2'>
                <span className='bg-secondary w-fit rounded px-2 py-0.5 text-xs'>{DIFF[l.difficulty] ?? l.difficulty}</span>
                {l.level && LEVEL_LABEL[l.level] && (
                  <span className='text-muted-foreground text-xs'>{LEVEL_LABEL[l.level]}</span>
                )}
              </div>
              <h2 className='font-bold'>{l.title}</h2>
              {l.description && <p className='text-secondary-foreground line-clamp-2 text-sm'>{l.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}
