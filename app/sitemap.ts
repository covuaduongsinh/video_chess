import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://covua.duongsinh.vn'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: videos }, { data: lessons }, { data: channels }, { data: tournaments }] = await Promise.all([
    supabase.from('vt_videos').select('id, updated_at').eq('status', 'published'),
    supabase.from('vt_lessons').select('slug, updated_at').eq('status', 'published'),
    supabase.from('vt_channels').select('slug'),
    supabase.from('vt_tournaments').select('slug, updated_at').neq('status', 'cancelled')
  ])

  const videoUrls: MetadataRoute.Sitemap = (videos ?? []).map((v) => ({
    url: `${SITE_URL}/watch?v=${v.id}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8
  }))

  const lessonUrls: MetadataRoute.Sitemap = (lessons ?? []).map((l) => ({
    url: `${SITE_URL}/learn/${l.slug}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7
  }))

  const channelUrls: MetadataRoute.Sitemap = (channels ?? []).map((c) => ({
    url: `${SITE_URL}/channel/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6
  }))

  const tournamentUrls: MetadataRoute.Sitemap = (tournaments ?? []).map((t) => ({
    url: `${SITE_URL}/tournaments/${t.slug}`,
    lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6
  }))

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/learn`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/learn/roadmap`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/tournaments`, changeFrequency: 'weekly', priority: 0.7 },
    ...videoUrls,
    ...lessonUrls,
    ...channelUrls,
    ...tournamentUrls
  ]
}
