-- =============================================================================
-- Video platform + Learning (PGN) subsystem schema
-- Project: tylootube (Cờ vua Dương Sinh)
-- Tất cả bảng dùng tiền tố `vt_` (video/tube) để cô lập, tránh va chạm với
-- các bảng ERP/Payload có sẵn trong cùng project.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers: updated_at trigger + is_admin()
-- ---------------------------------------------------------------------------
create or replace function public.vt_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles giữ role; is_admin() đọc role của user hiện tại
create or replace function public.vt_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vt_profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Profiles (gắn với auth.users) — Giai đoạn 1 chỉ chứa admin
-- ---------------------------------------------------------------------------
create table if not exists public.vt_profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  role         text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at   timestamptz not null default now()
);
alter table public.vt_profiles enable row level security;

-- ---------------------------------------------------------------------------
-- Channels
-- ---------------------------------------------------------------------------
create table if not exists public.vt_channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);
alter table public.vt_channels enable row level security;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table if not exists public.vt_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order int not null default 0
);
alter table public.vt_categories enable row level security;

-- ---------------------------------------------------------------------------
-- Videos (provider-agnostic)
-- ---------------------------------------------------------------------------
create table if not exists public.vt_videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  channel_id    uuid references public.vt_channels (id) on delete set null,
  category_id   uuid references public.vt_categories (id) on delete set null,
  provider      text not null default 'youtube'
                  check (provider in ('bunny','cloudflare','gdrive','onedrive','youtube','other')),
  source_id     text,          -- vd: Bunny videoId, Drive fileId, YouTube id
  source_url    text,          -- link gốc nếu có
  playback_url  text,          -- HLS .m3u8 (Bunny/Cloudflare) nếu có
  thumbnail_url text,          -- fallback suy ra từ provider nếu null
  duration      int,           -- giây
  views         bigint not null default 0,
  status        text not null default 'draft' check (status in ('draft','published','hidden')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  search_tsv    tsvector generated always as (
                  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))
                ) stored
);
create index if not exists vt_videos_status_idx       on public.vt_videos (status);
create index if not exists vt_videos_channel_idx      on public.vt_videos (channel_id);
create index if not exists vt_videos_category_idx     on public.vt_videos (category_id);
create index if not exists vt_videos_published_at_idx on public.vt_videos (published_at desc);
create index if not exists vt_videos_search_idx       on public.vt_videos using gin (search_tsv);
alter table public.vt_videos enable row level security;

create trigger vt_videos_updated_at
  before update on public.vt_videos
  for each row execute function public.vt_set_updated_at();

-- ---------------------------------------------------------------------------
-- Playlists + items
-- ---------------------------------------------------------------------------
create table if not exists public.vt_playlists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  visibility  text not null default 'public' check (visibility in ('public','unlisted','private')),
  created_at  timestamptz not null default now()
);
alter table public.vt_playlists enable row level security;

create table if not exists public.vt_playlist_items (
  playlist_id uuid not null references public.vt_playlists (id) on delete cascade,
  video_id    uuid not null references public.vt_videos (id) on delete cascade,
  position    int not null default 0,
  primary key (playlist_id, video_id)
);
alter table public.vt_playlist_items enable row level security;

-- ---------------------------------------------------------------------------
-- Viewer-facing tables (thiết kế sẵn, bật policy cho viewer ở giai đoạn sau)
-- ---------------------------------------------------------------------------
create table if not exists public.vt_comments (
  id         uuid primary key default gen_random_uuid(),
  video_id   uuid not null references public.vt_videos (id) on delete cascade,
  author_id  uuid references public.vt_profiles (id) on delete set null,
  body       text not null,
  parent_id  uuid references public.vt_comments (id) on delete cascade,
  status     text not null default 'visible' check (status in ('visible','hidden','pending')),
  created_at timestamptz not null default now()
);
alter table public.vt_comments enable row level security;

create table if not exists public.vt_video_likes (
  video_id uuid not null references public.vt_videos (id) on delete cascade,
  user_id  uuid not null references public.vt_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, user_id)
);
alter table public.vt_video_likes enable row level security;

create table if not exists public.vt_subscriptions (
  subscriber_id uuid not null references public.vt_profiles (id) on delete cascade,
  channel_id    uuid not null references public.vt_channels (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (subscriber_id, channel_id)
);
alter table public.vt_subscriptions enable row level security;

create table if not exists public.vt_watch_history (
  user_id          uuid not null references public.vt_profiles (id) on delete cascade,
  video_id         uuid not null references public.vt_videos (id) on delete cascade,
  progress_seconds int not null default 0,
  watched_at       timestamptz not null default now(),
  primary key (user_id, video_id)
);
alter table public.vt_watch_history enable row level security;

-- ---------------------------------------------------------------------------
-- Learning subsystem (PGN / lessons)
-- ---------------------------------------------------------------------------
create table if not exists public.vt_pgn_games (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  pgn         text not null,
  white       text,
  black       text,
  result      text,
  eco         text,
  event       text,
  site        text,
  date_played text,
  source      text,
  created_at  timestamptz not null default now()
);
create index if not exists vt_pgn_games_white_idx  on public.vt_pgn_games (white);
create index if not exists vt_pgn_games_black_idx  on public.vt_pgn_games (black);
create index if not exists vt_pgn_games_eco_idx    on public.vt_pgn_games (eco);
create index if not exists vt_pgn_games_result_idx on public.vt_pgn_games (result);
alter table public.vt_pgn_games enable row level security;

create table if not exists public.vt_lessons (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text,
  video_id    uuid references public.vt_videos (id) on delete set null,
  channel_id  uuid references public.vt_channels (id) on delete set null,
  category_id uuid references public.vt_categories (id) on delete set null,
  difficulty  text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  status      text not null default 'draft' check (status in ('draft','published','hidden')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists vt_lessons_status_idx on public.vt_lessons (status);
alter table public.vt_lessons enable row level security;

create trigger vt_lessons_updated_at
  before update on public.vt_lessons
  for each row execute function public.vt_set_updated_at();

create table if not exists public.vt_lesson_chapters (
  id              uuid primary key default gen_random_uuid(),
  lesson_id       uuid not null references public.vt_lessons (id) on delete cascade,
  title           text,
  position        int not null default 0,
  pgn             text not null,
  start_fen       text,
  video_timestamp int,  -- giây, đồng bộ bàn cờ với mốc video
  created_at      timestamptz not null default now()
);
create index if not exists vt_lesson_chapters_lesson_idx on public.vt_lesson_chapters (lesson_id, position);
alter table public.vt_lesson_chapters enable row level security;

create table if not exists public.vt_drill_sets (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid references public.vt_lessons (id) on delete cascade,
  title       text not null,
  pgn         text not null,
  orientation text not null default 'white' check (orientation in ('white','black')),
  mode        text not null default 'guess_move' check (mode in ('guess_move','both_sides')),
  created_at  timestamptz not null default now()
);
alter table public.vt_drill_sets enable row level security;

create table if not exists public.vt_srs_cards (
  id             uuid primary key default gen_random_uuid(),
  drill_set_id   uuid references public.vt_drill_sets (id) on delete cascade,
  lesson_id      uuid references public.vt_lessons (id) on delete cascade,
  fen            text not null,
  expected_move  text not null,   -- SAN hoặc UCI
  variation_path text,
  created_at     timestamptz not null default now()
);
create index if not exists vt_srs_cards_drill_idx on public.vt_srs_cards (drill_set_id);
alter table public.vt_srs_cards enable row level security;

-- per-user, bật cùng tài khoản người xem
create table if not exists public.vt_srs_reviews (
  user_id          uuid not null references public.vt_profiles (id) on delete cascade,
  card_id          uuid not null references public.vt_srs_cards (id) on delete cascade,
  due_at           timestamptz not null default now(),
  interval_days    int not null default 0,
  ease_factor      numeric not null default 2.5,
  repetitions      int not null default 0,
  last_reviewed_at timestamptz,
  primary key (user_id, card_id)
);
alter table public.vt_srs_reviews enable row level security;

create table if not exists public.vt_drill_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.vt_profiles (id) on delete set null,
  drill_set_id     uuid references public.vt_drill_sets (id) on delete cascade,
  errors           int not null default 0,
  duration_seconds int not null default 0,
  completed_at     timestamptz not null default now()
);
alter table public.vt_drill_attempts enable row level security;

-- ---------------------------------------------------------------------------
-- RPC: tăng lượt xem
-- ---------------------------------------------------------------------------
create or replace function public.vt_increment_video_views(p_video_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.vt_videos set views = views + 1 where id = p_video_id and status = 'published';
$$;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Public read cho nội dung đã publish; admin toàn quyền ghi.

-- channels: đọc công khai, admin ghi
create policy vt_channels_read on public.vt_channels for select using (true);
create policy vt_channels_admin on public.vt_channels for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

-- categories
create policy vt_categories_read on public.vt_categories for select using (true);
create policy vt_categories_admin on public.vt_categories for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

-- videos: anon chỉ đọc published; admin đọc tất cả + ghi
create policy vt_videos_read_published on public.vt_videos for select
  using (status = 'published' or public.vt_is_admin());
create policy vt_videos_admin on public.vt_videos for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

-- playlists
create policy vt_playlists_read on public.vt_playlists for select
  using (visibility = 'public' or public.vt_is_admin());
create policy vt_playlists_admin on public.vt_playlists for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());
create policy vt_playlist_items_read on public.vt_playlist_items for select using (true);
create policy vt_playlist_items_admin on public.vt_playlist_items for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

-- profiles: user đọc/sửa hồ sơ của mình; admin xem tất cả
create policy vt_profiles_self_read on public.vt_profiles for select
  using (id = auth.uid() or public.vt_is_admin());
create policy vt_profiles_self_update on public.vt_profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Bảng người xem (comments/likes/subscriptions/watch_history): Giai đoạn 1 chỉ admin.
-- (Giai đoạn sau thêm policy cho viewer.)
create policy vt_comments_read on public.vt_comments for select
  using (status = 'visible' or public.vt_is_admin());
create policy vt_comments_admin on public.vt_comments for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

create policy vt_video_likes_admin on public.vt_video_likes for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());
create policy vt_subscriptions_admin on public.vt_subscriptions for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());
create policy vt_watch_history_admin on public.vt_watch_history for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

-- Learning subsystem
create policy vt_pgn_games_read on public.vt_pgn_games for select using (true);
create policy vt_pgn_games_admin on public.vt_pgn_games for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

create policy vt_lessons_read on public.vt_lessons for select
  using (status = 'published' or public.vt_is_admin());
create policy vt_lessons_admin on public.vt_lessons for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

create policy vt_lesson_chapters_read on public.vt_lesson_chapters for select using (true);
create policy vt_lesson_chapters_admin on public.vt_lesson_chapters for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

create policy vt_drill_sets_read on public.vt_drill_sets for select using (true);
create policy vt_drill_sets_admin on public.vt_drill_sets for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

create policy vt_srs_cards_read on public.vt_srs_cards for select using (true);
create policy vt_srs_cards_admin on public.vt_srs_cards for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());

create policy vt_srs_reviews_self on public.vt_srs_reviews for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy vt_drill_attempts_admin on public.vt_drill_attempts for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());
