'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({ name: z.string().min(1), slug: z.string().min(1) })

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { name, slug } = schema.parse({ name: formData.get('name'), slug: formData.get('slug') })
  const sortOrder = Number((formData.get('sort_order') ?? '0').toString() || '0')
  const { error } = await supabase.from('vt_categories').insert({ name, slug, sort_order: sortOrder })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
  revalidatePath('/')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('vt_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
  revalidatePath('/')
}
