import { createClient } from '@/lib/supabase/server'

export type Category = { id: string; name: string; slug: string }
export type Channel = { id: string; slug: string; name: string; description: string | null; avatarUrl: string | null }
export type Playlist = { id: string; name: string; slug: string }

/** Danh mục cho thanh CategoryPills (kèm 'All' ở đầu). */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_channels')
    .select('id, slug, name, description, avatar_url')
    .eq('slug', slug)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    avatarUrl: data.avatar_url
  }
}

export async function getSubscriptionChannels(limit = 10): Promise<Channel[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_channels')
    .select('id, slug, name, description, avatar_url')
    .order('name', { ascending: true })
    .limit(limit)
  return (data ?? []).map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    description: d.description,
    avatarUrl: d.avatar_url
  }))
}

/** Tất cả kênh (cho dropdown trong admin). */
export async function getAllChannels(): Promise<Channel[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_channels')
    .select('id, slug, name, description, avatar_url')
    .order('name', { ascending: true })
  return (data ?? []).map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    description: d.description,
    avatarUrl: d.avatar_url
  }))
}

export async function getPlaylists(): Promise<Playlist[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_playlists')
    .select('id, name, slug')
    .eq('visibility', 'public')
    .order('created_at', { ascending: true })
  return data ?? []
}
