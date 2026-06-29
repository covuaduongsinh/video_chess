'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const str = (v: FormDataEntryValue | null) => {
  const t = (v ?? '').toString().trim()
  return t === '' ? null : t
}
const schema = z.object({ name: z.string().min(1), slug: z.string().min(1) })

function row(formData: FormData) {
  const { name, slug } = schema.parse({ name: formData.get('name'), slug: formData.get('slug') })
  return {
    name,
    slug,
    description: str(formData.get('description')),
    avatar_url: str(formData.get('avatar_url'))
  }
}

export async function createChannel(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_channels').insert(row(formData))
  if (error) throw new Error(error.message)
  revalidatePath('/admin/channels')
  redirect('/admin/channels')
}

export async function updateChannel(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_channels').update(row(formData)).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/channels')
  redirect('/admin/channels')
}

export async function deleteChannel(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_channels').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/channels')
}
