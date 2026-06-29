-- =============================================================================
-- Migration 0002: Mở tài khoản học viên (Phase 2)
-- - Trigger tạo vt_profiles tự động khi user mới đăng ký (role viewer mặc định)
-- - RLS policies cho phép viewer thao tác dữ liệu của chính mình
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Trigger: tự động tạo vt_profiles khi có auth.users mới
-- ---------------------------------------------------------------------------
create or replace function public.vt_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.vt_profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger vt_on_auth_user_created
  after insert on auth.users
  for each row execute function public.vt_handle_new_user();

-- ---------------------------------------------------------------------------
-- Profiles: cho phép viewer tự insert hồ sơ (trường hợp trigger chạy trước chính mình)
-- ---------------------------------------------------------------------------
create policy vt_profiles_self_insert on public.vt_profiles for insert
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Comments: viewer insert bình luận của chính mình (status pending review)
-- ---------------------------------------------------------------------------
create policy vt_comments_viewer_insert on public.vt_comments for insert
  with check (
    auth.uid() is not null
    and author_id = auth.uid()
    and not public.vt_is_admin()
  );

-- Viewer chỉnh sửa bình luận của chính mình (chưa xoá — để admin kiểm duyệt)
create policy vt_comments_viewer_update on public.vt_comments for update
  using (author_id = auth.uid() and not public.vt_is_admin())
  with check (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Video likes: viewer like/unlike của chính mình
-- ---------------------------------------------------------------------------
create policy vt_video_likes_viewer on public.vt_video_likes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Subscriptions: viewer đăng ký/huỷ kênh (cột là subscriber_id, không phải user_id)
-- ---------------------------------------------------------------------------
create policy vt_subscriptions_viewer on public.vt_subscriptions for all
  using (subscriber_id = auth.uid())
  with check (subscriber_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Watch history: viewer ghi lịch sử xem
-- ---------------------------------------------------------------------------
create policy vt_watch_history_viewer on public.vt_watch_history for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Drill attempts: viewer ghi kết quả luyện tập
-- ---------------------------------------------------------------------------
create policy vt_drill_attempts_viewer on public.vt_drill_attempts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- (vt_srs_reviews đã có policy self từ 0001 — không cần thêm)
