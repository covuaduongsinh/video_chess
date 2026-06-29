'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={async () => {
        await createClient().auth.signOut()
        router.push('/admin/login')
        router.refresh()
      }}
    >
      <LogOut className='mr-1 h-4 w-4' /> Đăng xuất
    </Button>
  )
}
