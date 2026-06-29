import { createClient } from '@/lib/supabase/server'
import { PageHeader } from './page-header'

/**
 * Server wrapper: lấy thông tin user rồi truyền xuống PageHeader (client).
 * Dùng component này ở các Server Pages thay vì import PageHeader trực tiếp.
 */
export async function PageHeaderServer() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  let userInfo: { email: string | undefined; displayName: string | null; avatarUrl: string | null } | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('vt_profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single()
    userInfo = {
      email: user.email,
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null
    }
  }

  return <PageHeader user={userInfo} />
}
