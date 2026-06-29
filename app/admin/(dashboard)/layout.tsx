import { AdminNav } from '@/components/admin/admin-nav'
import { SignOutButton } from '@/components/admin/sign-out-button'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('vt_profiles').select('role, display_name').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className='flex min-h-screen flex-col'>
      <header className='border-border flex items-center justify-between border-b px-4 py-3'>
        <Link href='/admin' className='font-bold'>
          TylooTube Admin
        </Link>
        <div className='flex items-center gap-3'>
          <span className='text-secondary-foreground text-sm'>{profile?.display_name ?? user.email}</span>
          <Link href='/' className='text-sm underline'>
            Xem trang
          </Link>
          <SignOutButton />
        </div>
      </header>
      <div className='grid flex-1 grid-cols-1 md:grid-cols-[220px_1fr]'>
        <aside className='border-border border-r p-3'>
          <AdminNav />
        </aside>
        <main className='p-6'>{children}</main>
      </div>
    </div>
  )
}
