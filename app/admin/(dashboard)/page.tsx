import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

async function count(table: string) {
  const supabase = await createClient()
  const { count } = await supabase.from(table as never).select('*', { count: 'exact', head: true })
  return count ?? 0
}

export default async function AdminDashboard() {
  const [videos, channels, categories, lessons, pgn, tournaments] = await Promise.all([
    count('vt_videos'),
    count('vt_channels'),
    count('vt_categories'),
    count('vt_lessons'),
    count('vt_pgn_games'),
    count('vt_tournaments')
  ])

  const cards = [
    { label: 'Video', value: videos, href: '/admin/videos' },
    { label: 'Kênh', value: channels, href: '/admin/channels' },
    { label: 'Danh mục', value: categories, href: '/admin/categories' },
    { label: 'Bài học', value: lessons, href: '/admin/lessons' },
    { label: 'Ván PGN', value: pgn, href: '/admin/pgn' },
    { label: 'Giải đấu', value: tournaments, href: '/admin/tournaments' }
  ]

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Tổng quan</h1>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'>
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className='border-border rounded-lg border p-4 hover:bg-accent/40'>
            <div className='text-3xl font-bold'>{c.value}</div>
            <div className='text-secondary-foreground text-sm'>{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
