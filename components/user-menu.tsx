'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { LogIn, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Props = {
  user: { email: string | undefined; displayName: string | null; avatarUrl: string | null } | null
}

export function UserMenu({ user }: Props) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <Button variant='ghost' size='icon' asChild aria-label='Đăng nhập'>
        <Link href='/login'>
          <LogIn className='size-4' />
        </Link>
      </Button>
    )
  }

  return (
    <div className='flex items-center gap-1'>
      <Button variant='ghost' size='icon' asChild aria-label='Hồ sơ'>
        <Link href='/me'>
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt='Avatar' className='h-6 w-6 rounded-full' />
          ) : (
            <User className='size-4' />
          )}
        </Link>
      </Button>
      <Button variant='ghost' size='icon' onClick={signOut} aria-label='Đăng xuất'>
        <LogOut className='size-4' />
      </Button>
    </div>
  )
}
