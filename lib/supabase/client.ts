import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/** Supabase client cho Client Components (chạy trong trình duyệt). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
