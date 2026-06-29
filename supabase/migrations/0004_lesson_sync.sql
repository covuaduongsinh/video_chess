-- Đợt 6 — Đồng bộ Video ↔ PGN (bàn cờ)
-- 1) Mốc theo từng nước (move_cues) cho từng chương bài học → "karaoke" video-bàn cờ.
-- 2) Liên kết kho ván cờ (vt_pgn_games) ↔ video để "khám phá ngược".

-- 1) Cột move_cues: mảng [{ "idx": <vị trí bàn cờ>, "t": <giây> }] (cho phép thưa).
alter table public.vt_lesson_chapters
  add column if not exists move_cues jsonb not null default '[]'::jsonb;

-- 2) Bảng nối nhiều-nhiều giữa video và ván cờ (curated). Một ván có thể xuất hiện ở nhiều video.
create table if not exists public.vt_video_pgn_games (
  video_id    uuid not null references public.vt_videos (id) on delete cascade,
  pgn_game_id uuid not null references public.vt_pgn_games (id) on delete cascade,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  primary key (video_id, pgn_game_id)
);
create index if not exists vt_video_pgn_games_game_idx on public.vt_video_pgn_games (pgn_game_id);
alter table public.vt_video_pgn_games enable row level security;

-- RLS: đọc công khai, ghi chỉ admin (đúng quy ước repo).
create policy vt_video_pgn_games_read on public.vt_video_pgn_games for select using (true);
create policy vt_video_pgn_games_admin on public.vt_video_pgn_games for all
  using (public.vt_is_admin()) with check (public.vt_is_admin());
