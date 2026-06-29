'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const str = (v: FormDataEntryValue | null) => {
  const t = (v ?? '').toString().trim()
  return t === '' ? null : t
}

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(['upcoming', 'ongoing', 'finished', 'cancelled'])
})

export async function createTournament(formData: FormData) {
  const { title, slug, status } = schema.parse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    status: formData.get('status')
  })
  const description = str(formData.get('description'))
  const dateStart = str(formData.get('date_start'))
  const dateEnd = str(formData.get('date_end'))
  const location = str(formData.get('location'))
  const prizeInfo = str(formData.get('prize_info'))
  const coverUrl = str(formData.get('cover_url'))

  const supabase = await createClient()
  const { error } = await supabase
    .from('vt_tournaments')
    .insert({ title, slug, status, description, date_start: dateStart, date_end: dateEnd, location, prize_info: prizeInfo, cover_url: coverUrl })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/tournaments')
  revalidatePath('/tournaments')
  redirect('/admin/tournaments')
}

export async function deleteTournament(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_tournaments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/tournaments')
  revalidatePath('/tournaments')
}
