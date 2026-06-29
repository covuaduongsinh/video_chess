import { AppShell } from '@/components/app-shell'
import { getPublishedLessons } from '@/lib/queries/learning'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Lộ trình 6 cấp',
  description: 'Lộ trình đào tạo cờ vua Dương Sinh: Tốt → Mã → Tượng → Xe → Hậu → Vua'
}

const LEVELS = [
  {
    key: 'tot',
    name: 'Tốt',
    emoji: '♟',
    desc: 'Quy tắc cơ bản, đi quân, chiếu hết đơn giản',
    color: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/40'
  },
  {
    key: 'ma',
    name: 'Mã',
    emoji: '♞',
    desc: 'Chiến thuật cơ bản, đòn kết hợp, phát triển quân',
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/40'
  },
  {
    key: 'tuong',
    name: 'Tượng',
    emoji: '♝',
    desc: 'Khai cuộc phổ biến, kế hoạch trung cuộc',
    color: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/40'
  },
  {
    key: 'xe',
    name: 'Xe',
    emoji: '♜',
    desc: 'Tấn công vua, phòng thủ, tàn cuộc cơ bản',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/40'
  },
  {
    key: 'hau',
    name: 'Hậu',
    emoji: '♛',
    desc: 'Lý thuyết khai cuộc, phân tích sâu, đòn phối hợp',
    color: 'from-orange-500/20 to-orange-500/5',
    border: 'border-orange-500/40'
  },
  {
    key: 'vua',
    name: 'Vua',
    emoji: '♚',
    desc: 'Chiến lược nâng cao, tư duy độc lập, giải đấu',
    color: 'from-yellow-500/20 to-yellow-500/5',
    border: 'border-yellow-500/40'
  }
] as const

const DIFF: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao'
}

export default async function RoadmapPage() {
  // Lấy tất cả bài học đã publish một lần, rồi nhóm client-side
  const lessons = await getPublishedLessons()
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l.key, lessons.filter((les) => les.level === l.key)]))

  return (
    <AppShell>
      <div className='mx-auto max-w-4xl space-y-8'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold'>Lộ trình 6 cấp Dương Sinh</h1>
          <p className='text-muted-foreground mt-2'>Tốt → Mã → Tượng → Xe → Hậu → Vua</p>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {LEVELS.map((level, idx) => {
            const levelLessons = byLevel[level.key] ?? []
            return (
              <div
                key={level.key}
                className={`border ${level.border} rounded-xl bg-gradient-to-b ${level.color} p-4`}
              >
                <div className='mb-3 flex items-center gap-3'>
                  <span className='text-3xl' role='img' aria-label={level.name}>
                    {level.emoji}
                  </span>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground text-xs'>Cấp {idx + 1}</span>
                    </div>
                    <h2 className='text-lg font-bold'>{level.name}</h2>
                  </div>
                </div>
                <p className='text-muted-foreground mb-3 text-sm'>{level.desc}</p>

                {levelLessons.length === 0 ? (
                  <p className='text-muted-foreground text-xs italic'>Chưa có bài học.</p>
                ) : (
                  <ul className='space-y-1.5'>
                    {levelLessons.map((l) => (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${l.slug}`}
                          className='hover:text-primary flex items-center gap-1.5 text-sm underline-offset-2 hover:underline'
                        >
                          <span className='text-muted-foreground text-xs'>{DIFF[l.difficulty] ?? l.difficulty}</span>
                          {l.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <div className='mt-3'>
                  <Link
                    href={`/learn?level=${level.key}`}
                    className='text-primary text-xs underline underline-offset-2'
                  >
                    Xem tất cả ({levelLessons.length}) →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className='border-border rounded-lg border p-4 text-center'>
          <p className='text-muted-foreground text-sm'>
            Chưa có tài khoản?{' '}
            <Link href='/register' className='text-primary underline'>
              Đăng ký học viên miễn phí
            </Link>{' '}
            để theo dõi tiến trình và ôn tập SRS.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
