import { createClient } from '@/lib/supabase/server'
import { toThumbnailUrl, type VideoProvider } from '@/lib/providers/embed'

export type VideoCard = {
  id: string
  title: string
  views: number
  duration: number | null
  publishedAt: string | null
  thumbnailUrl: string | null
  channel: { slug: string; name: string; avatarUrl: string | null } | null
}

export type VideoDetail = VideoCard & {
  description: string | null
  provider: VideoProvider
  sourceId: string | null
  sourceUrl: string | null
  playbackUrl: string | null
  categoryId: string | null
  channelId: string | null
  category: { slug: string; name: string } | null
  status: string
}

type Row = {
  id: string
  title: string
  description: string | null
  views: number
  duration: number | null
  published_at: string | null
  provider: string
  source_id: string | null
  source_url: string | null
  playback_url: string | null
  thumbnail_url: string | null
  category_id: string | null
  channel_id: string | null
  status: string
  channel: { slug: string; name: string; avatar_url: string | null } | null
  category: { slug: string; name: string } | null
}

const SELECT = `
  id, title, description, views, duration, published_at,
  provider, source_id, source_url, playback_url, thumbnail_url, category_id, channel_id, status,
  channel:vt_channels(slug, name, avatar_url),
  category:vt_categories(slug, name)
`

function toCard(r: Row): VideoCard {
  return {
    id: r.id,
    title: r.title,
    views: r.views,
    duration: r.duration,
    publishedAt: r.published_at,
    thumbnailUrl: toThumbnailUrl({
      provider: r.provider as VideoProvider,
      sourceId: r.source_id,
      sourceUrl: r.source_url,
      thumbnailUrl: r.thumbnail_url
    }),
    channel: r.channel ? { slug: r.channel.slug, name: r.channel.name, avatarUrl: r.channel.avatar_url } : null
  }
}

function toDetail(r: Row): VideoDetail {
  return {
    ...toCard(r),
    description: r.description,
    provider: r.provider as VideoProvider,
    sourceId: r.source_id,
    sourceUrl: r.source_url,
    playbackUrl: r.playback_url,
    categoryId: r.category_id,
    channelId: r.channel_id,
    category: r.category ? { slug: r.category.slug, name: r.category.name } : null,
    status: r.status
  }
}

/** Video đã publish cho trang chủ, lọc tuỳ chọn theo slug danh mục. */
export async function getPublishedVideos(categorySlug?: string): Promise<VideoCard[]> {
  const supabase = await createClient()
  let query = supabase
    .from('vt_videos')
    .select(SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (categorySlug && categorySlug !== 'all') {
    const { data: cat } = await supabase.from('vt_categories').select('id').eq('slug', categorySlug).maybeSingle()
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data } = await query.returns<Row[]>()
  return (data ?? []).map(toCard)
}

export async function getVideoById(id: string): Promise<VideoDetail | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('vt_videos').select(SELECT).eq('id', id).maybeSingle<Row>()
  return data ? toDetail(data) : null
}

/**
 * Video liên quan: ưu tiên cùng danh mục hoặc cùng kênh, rồi lấp đầy bằng
 * video mới nhất còn lại. Loại trừ video hiện tại.
 */
export async function getRelatedVideos(
  excludeId: string,
  opts: { categoryId?: string | null; channelId?: string | null } = {},
  limit = 12
): Promise<VideoCard[]> {
  const supabase = await createClient()
  const { categoryId, channelId } = opts

  // Điều kiện ưu tiên: cùng danh mục hoặc cùng kênh (chỉ ghép cái non-null).
  const orFilters = [
    categoryId ? `category_id.eq.${categoryId}` : null,
    channelId ? `channel_id.eq.${channelId}` : null
  ].filter((f): f is string => f !== null)

  const picked: Row[] = []
  const seen = new Set<string>([excludeId])

  if (orFilters.length > 0) {
    const { data } = await supabase
      .from('vt_videos')
      .select(SELECT)
      .eq('status', 'published')
      .neq('id', excludeId)
      .or(orFilters.join(','))
      .order('published_at', { ascending: false })
      .limit(limit)
      .returns<Row[]>()
    for (const r of data ?? []) {
      if (seen.has(r.id)) continue
      seen.add(r.id)
      picked.push(r)
    }
  }

  // Lấp đầy phần còn thiếu bằng video mới nhất khác.
  if (picked.length < limit) {
    const { data } = await supabase
      .from('vt_videos')
      .select(SELECT)
      .eq('status', 'published')
      .neq('id', excludeId)
      .order('published_at', { ascending: false })
      .limit(limit)
      .returns<Row[]>()
    for (const r of data ?? []) {
      if (picked.length >= limit) break
      if (seen.has(r.id)) continue
      seen.add(r.id)
      picked.push(r)
    }
  }

  return picked.slice(0, limit).map(toCard)
}

export async function searchVideos(q: string): Promise<VideoCard[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_videos')
    .select(SELECT)
    .eq('status', 'published')
    .textSearch('search_tsv', q, { type: 'websearch', config: 'simple' })
    .returns<Row[]>()
  return (data ?? []).map(toCard)
}

export async function getPlaylistVideos(
  slug: string
): Promise<{ name: string; videos: VideoCard[] } | null> {
  const supabase = await createClient()
  const { data: pl } = await supabase.from('vt_playlists').select('id, name').eq('slug', slug).maybeSingle()
  if (!pl) return null
  const { data } = await supabase
    .from('vt_playlist_items')
    .select(`position, video:vt_videos(${SELECT})`)
    .eq('playlist_id', pl.id)
    .order('position', { ascending: true })
    .returns<{ position: number; video: Row | null }[]>()
  const videos = (data ?? []).map((d) => d.video).filter((v): v is Row => v !== null).map(toCard)
  return { name: pl.name, videos }
}

export type AdminVideoRow = {
  id: string
  title: string
  status: string
  views: number
  channelName: string | null
}

/** Danh sách tất cả video (kể cả nháp/ẩn) cho admin. */
export async function getVideosForAdmin(): Promise<AdminVideoRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_videos')
    .select('id, title, status, views, channel:vt_channels(name)')
    .order('created_at', { ascending: false })
    .returns<{ id: string; title: string; status: string; views: number; channel: { name: string } | null }[]>()
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    views: r.views,
    channelName: r.channel?.name ?? null
  }))
}

export async function getChannelVideos(channelSlug: string): Promise<VideoCard[]> {
  const supabase = await createClient()
  const { data: ch } = await supabase.from('vt_channels').select('id').eq('slug', channelSlug).maybeSingle()
  if (!ch) return []
  const { data } = await supabase
    .from('vt_videos')
    .select(SELECT)
    .eq('status', 'published')
    .eq('channel_id', ch.id)
    .order('published_at', { ascending: false })
    .returns<Row[]>()
  return (data ?? []).map(toCard)
}
