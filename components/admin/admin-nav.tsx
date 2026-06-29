'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Tổng quan', exact: true },
  { href: '/admin/videos', label: 'Video' },
  { href: '/admin/channels', label: 'Kênh' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/playlists', label: 'Playlist' },
  { href: '/admin/pgn', label: 'CSDL PGN' },
  { href: '/admin/lessons', label: 'Bài học' },
  { href: '/admin/drills', label: 'Luyện tập (Drill)' }
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className='flex flex-col gap-1'>
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm',
              active ? 'bg-accent font-semibold' : 'hover:bg-accent/50'
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
