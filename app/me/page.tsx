import { AppShell } from '@/components/app-shell'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Hồ sơ của tôi' }

export default async function MePage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/me')

  const { data: profile } = await supabase
    .from('vt_profiles')
    .select('display_name, avatar_url, role, created_at')
    .eq('id', user.id)
    .single()

  // Thống kê học tập
  const [{ count: drillCount }, { count: reviewCount }] = await Promise.all([
    supabase.from('vt_drill_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('vt_srs_reviews').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  ])

  return (
    <AppShell>
      <div className='mx-auto max-w-2xl space-y-6'>
        <div className='flex items-center gap-4'>
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt='Avatar' className='h-16 w-16 rounded-full' />
          ) : (
            <div className='bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold'>
              {(profile?.display_name ?? user.email ?? '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className='text-2xl font-bold'>{profile?.display_name ?? 'Học viên'}</h1>
            <p className='text-muted-foreground text-sm'>{user.email}</p>
            <p className='text-muted-foreground text-xs'>
              Tham gia từ {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : ''}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
          <StatCard label='Bài drill đã hoàn thành' value={drillCount ?? 0} />
          <StatCard label='Thẻ SRS đã ôn' value={reviewCount ?? 0} />
        </div>

        <div className='border-border rounded-lg border p-4'>
          <h2 className='mb-3 font-semibold'>Tài khoản</h2>
          <div className='text-muted-foreground space-y-1 text-sm'>
            <p>Email: {user.email}</p>
            <p>Vai trò: {profile?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className='border-border rounded-lg border p-4 text-center'>
      <p className='text-primary text-3xl font-bold'>{value}</p>
      <p className='text-muted-foreground text-xs'>{label}</p>
    </div>
  )
}
