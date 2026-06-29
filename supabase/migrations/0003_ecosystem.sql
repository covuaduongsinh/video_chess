-- =============================================================================
-- Migration 0003: Hệ sinh thái Dương Sinh (Phase 3)
-- - Thêm cột level (lộ trình 6 cấp) vào vt_lessons
-- - Bảng vt_tournaments (giải đấu)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Lộ trình 6 cấp Dương Sinh: Tốt → Mã → Tượng → Xe → Hậu → Vua
-- Thêm cột level vào vt_lessons (nullable để không phá bản ghi cũ)
-- ---------------------------------------------------------------------------
alter table public.vt_lessons
  add column if not exists level text
    check (level in ('tot', 'ma', 'tuong', 'xe', 'hau', 'vua'));

-- ---------------------------------------------------------------------------
-- Giải đấu (vt_tournaments)
-- ---------------------------------------------------------------------------
create table if not exists public.vt_tournaments (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text,
  date_start  date,
  date_end    date,
  location    text,
  status      text not null default 'upcoming'
                check (status in ('upcoming', 'ongoing', 'finished', 'cancelled')),
  prize_info  text,
  cover_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.vt_tournaments enable row level security;

create trigger vt_tournaments_set_updated_at
  before update on public.vt_tournaments
  for each row execute function public.vt_set_updated_at();

-- RLS: công khai đọc, admin ghi
create policy vt_tournaments_read on public.vt_tournaments
  for select using (status != 'cancelled' or public.vt_is_admin());
create policy vt_tournaments_admin on public.vt_tournaments
  for all using (public.vt_is_admin()) with check (public.vt_is_admin());
