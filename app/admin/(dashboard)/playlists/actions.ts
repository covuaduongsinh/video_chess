'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({ name: z.string().min(1), slug: z.string().min(1) })

export async function createPlaylist(formData: FormData) {
  const { name, slug } = schema.parse({ name: formData.get('name'), slug: formData.get('slug') })
  const description = (formData.get('description') ?? '').toString().trim() || null
  const supabase = await createClient()
  const { error } = await supabase.from('vt_playlists').insert({ name, slug, description })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/playlists')
}

export async function deletePlaylist(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_playlists').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/playlists')
}
