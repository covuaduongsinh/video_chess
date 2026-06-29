import { createClient } from '@/lib/supabase/server'

export type Tournament = {
  id: string
  title: string
  slug: string
  description: string | null
  dateStart: string | null
  dateEnd: string | null
  location: string | null
  status: string
  prizeInfo: string | null
  coverUrl: string | null
}

export async function getPublicTournaments(): Promise<Tournament[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_tournaments')
    .select('id, title, slug, description, date_start, date_end, location, status, prize_info, cover_url')
    .neq('status', 'cancelled')
    .order('date_start', { ascending: false, nullsFirst: false })
  return (data ?? []).map(toTournament)
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_tournaments')
    .select('id, title, slug, description, date_start, date_end, location, status, prize_info, cover_url')
    .eq('slug', slug)
    .maybeSingle()
  return data ? toTournament(data) : null
}

export async function getTournamentsForAdmin(): Promise<Tournament[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('vt_tournaments')
    .select('id, title, slug, description, date_start, date_end, location, status, prize_info, cover_url')
    .order('created_at', { ascending: false })
  return (data ?? []).map(toTournament)
}

function toTournament(r: {
  id: string; title: string; slug: string; description: string | null
  date_start: string | null; date_end: string | null; location: string | null
  status: string; prize_info: string | null; cover_url: string | null
}): Tournament {
  return {
    id: r.id, title: r.title, slug: r.slug, description: r.description,
    dateStart: r.date_start, dateEnd: r.date_end, location: r.location,
    status: r.status, prizeInfo: r.prize_info, coverUrl: r.cover_url
  }
}
