import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

/**
 * Supabase client cho Server Components / Server Actions / Route Handlers.
 * Đọc & ghi session qua cookie. Trong Server Component, thao tác set cookie có
 * thể bị bỏ qua (chỉ middleware mới refresh được) — đã bọc try/catch an toàn.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Được gọi từ Server Component — bỏ qua, middleware sẽ lo refresh session.
          }
        }
      }
    }
  )
}
