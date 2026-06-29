import { AppShell } from '@/components/app-shell'
import { getPublishedLessons } from '@/lib/queries/learning'
import Link from 'next/link'

const DIFF: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao'
}

export default async function LearnPage() {
  const lessons = await getPublishedLessons()

  return (
    <AppShell>
      <h1 className='mb-4 text-2xl font-bold'>Học qua video + cờ</h1>
      {lessons.length === 0 ? (
        <p className='text-secondary-foreground'>Chưa có bài học nào.</p>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {lessons.map((l) => (
            <Link
              key={l.id}
              href={`/learn/${l.slug}`}
              className='border-border hover:bg-accent/40 flex flex-col gap-2 rounded-lg border p-4'
            >
              <span className='bg-secondary w-fit rounded px-2 py-0.5 text-xs'>{DIFF[l.difficulty] ?? l.difficulty}</span>
              <h2 className='font-bold'>{l.title}</h2>
              {l.description && <p className='text-secondary-foreground line-clamp-2 text-sm'>{l.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}
