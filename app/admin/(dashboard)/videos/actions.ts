'use server'

import { extractDriveId, extractYouTubeId } from '@/lib/providers/embed'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const str = (v: FormDataEntryValue | null) => {
  const t = (v ?? '').toString().trim()
  return t === '' ? null : t
}
const num = (v: FormDataEntryValue | null) => {
  const t = str(v)
  return t === null ? null : Number(t)
}

const schema = z.object({
  title: z.string().min(1, 'Tiêu đề bắt buộc'),
  provider: z.enum(['bunny', 'cloudflare', 'gdrive', 'onedrive', 'youtube', 'other']),
  status: z.enum(['draft', 'published', 'hidden'])
})

function buildRow(formData: FormData) {
  const { title, provider, status } = schema.parse({
    title: formData.get('title'),
    provider: formData.get('provider'),
    status: formData.get('status')
  })

  let sourceId = str(formData.get('source_id'))
  const sourceUrl = str(formData.get('source_url'))

  // Tự tách ID từ link nếu admin chỉ dán URL.
  if (!sourceId && sourceUrl) {
    if (provider === 'gdrive') sourceId = extractDriveId(sourceUrl)
    if (provider === 'youtube') sourceId = extractYouTubeId(sourceUrl)
  }

  const publishedAtInput = str(formData.get('published_at'))

  return {
    title,
    description: str(formData.get('description')),
    provider,
    source_id: sourceId,
    source_url: sourceUrl,
    playback_url: str(formData.get('playback_url')),
    thumbnail_url: str(formData.get('thumbnail_url')),
    channel_id: str(formData.get('channel_id')),
    category_id: str(formData.get('category_id')),
    duration: num(formData.get('duration')),
    status,
    published_at: publishedAtInput ?? (status === 'published' ? new Date().toISOString() : null)
  }
}

export async function createVideo(formData: FormData) {
  const supabase = await createClient()
  const row = buildRow(formData)
  const { error } = await supabase.from('vt_videos').insert(row)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/videos')
  revalidatePath('/')
  redirect('/admin/videos')
}

export async function updateVideo(id: string, formData: FormData) {
  const supabase = await createClient()
  const row = buildRow(formData)
  const { error } = await supabase.from('vt_videos').update(row).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/videos')
  revalidatePath('/')
  redirect('/admin/videos')
}

export async function deleteVideo(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_videos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/videos')
  revalidatePath('/')
}

// --- Gắn ván cờ liên quan vào video (khám phá ngược) ----------------------

export async function linkGameToVideo(videoId: string, formData: FormData) {
  const gameId = str(formData.get('pgn_game_id'))
  if (!gameId) return
  const supabase = await createClient()
  const { error } = await supabase
    .from('vt_video_pgn_games')
    .insert({ video_id: videoId, pgn_game_id: gameId })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/videos/${videoId}`)
  revalidatePath('/watch')
}

export async function unlinkGameFromVideo(videoId: string, gameId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('vt_video_pgn_games')
    .delete()
    .eq('video_id', videoId)
    .eq('pgn_game_id', gameId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/videos/${videoId}`)
  revalidatePath('/watch')
}
