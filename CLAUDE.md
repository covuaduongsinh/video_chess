# CLAUDE.md — Dự án Video Chess (Cờ vua Dương Sinh)

Hướng dẫn cho Claude khi làm việc trong repo này. Đọc file này trước khi sửa code.

---

## 1. Dự án là gì

**Video Chess** là nền tảng video kiểu YouTube **chuyên cho cờ vua**, phục vụ hệ sinh thái
Công ty CP Cờ vua Dương Sinh ("Vui trí tuệ"). Nền tảng kết hợp 3 mảng:

1. **Video** — phát video bài giảng/giải đấu, provider-agnostic (YouTube, Google Drive, Bunny, Cloudflare, OneDrive).
2. **Cơ sở dữ liệu ván cờ (PGN)** — lưu, tra cứu và xem lại ván cờ trên bàn cờ tương tác.
3. **Học tập (Learning)** — bài học gắn chương PGN, bài tập (drill) luyện nước đi, và ôn tập theo
   thuật toán lặp lại ngắt quãng SRS (SM-2), xuất thẻ sang Anki.

Repo **fork từ `tyloo/tylootube`** (một YouTube clone Next.js) rồi cải tạo thành nền tảng cờ vua.

- Origin (của Dương Sinh): `https://github.com/covuaduongsinh/video_chess.git`
- Upstream (gốc): `https://github.com/tyloo/tylootube.git` — chỉ kéo về khi cần vá/cập nhật nền.

> Định hướng sản phẩm: ưu tiên **phong trào & giáo dục tư duy trẻ em** hơn thành tích. Lộ trình
> đào tạo 6 cấp của Dương Sinh: Tốt → Mã → Tượng → Xe → Hậu → Vua (dùng làm gợi ý phân cấp
> `difficulty`/danh mục khi cần).

---

## 2. Tech stack

- **Next.js 16.1.4** (App Router, **Turbopack**) — lưu ý: Next 16 đổi tên `middleware.ts` → **`proxy.ts`**.
- **React 19.2** + **TypeScript 5**.
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) — xem `components.json`, `components/ui/`.
- **Supabase** — Postgres + Auth + Row Level Security (RLS). Client qua `@supabase/ssr` + `@supabase/supabase-js`.
- **Cờ vua**: `chess.js` (logic), `react-chessboard` (bàn cờ), `@mliebelt/pgn-parser` (parse PGN).
- **Video**: `hls.js` (phát HLS `.m3u8` cho Bunny/Cloudflare).
- **next-themes** (dark mode), `lucide-react` (icon), `zod` (validate).
- **Package manager: `pnpm`** (có `pnpm-lock.yaml`). KHÔNG dùng npm/yarn trong repo này.

---

## 3. Lệnh thường dùng

```bash
pnpm install      # cài dependencies
pnpm dev          # chạy dev (Turbopack) tại http://localhost:3000
pnpm build        # build production
pnpm start        # chạy bản build
pnpm lint         # ESLint (eslint-config-next)
```

Format code: Prettier (`.prettierrc`) + plugin `organize-imports` và `tailwindcss`.
Chạy `pnpm exec prettier --write .` nếu cần.

---

## 4. Cấu trúc thư mục

```
app/
  page.tsx                     # Trang chủ (grid video)
  watch/ search/ playlist/     # Các trang công khai cho người xem
  channel/[slug]/              # Trang kênh
  learn/  learn/[slug]/        # Mảng học tập (bài học + PGN/drill)
  admin/
    login/                     # Đăng nhập admin
    (dashboard)/               # Khu quản trị (route group)
      page.tsx                 # Tổng quan (đếm video/kênh/danh mục/bài học/PGN)
      videos/ channels/ categories/ playlists/   # CRUD nội dung
      lessons/ drills/ pgn/    # CRUD học tập
      */actions.ts             # Server Actions cho từng mục
  api/export/anki/route.ts     # Xuất thẻ SRS sang định dạng Anki (TSV)

components/
  chess/                       # chess-board-viewer, pgn-trainer
  admin/                       # admin-nav, video-form, sign-out
  learn/                       # lesson-view
  ui/                          # shadcn components
  video-player, video-grid-item, app-shell, app-sidebar, ...

lib/
  chess/    pgn.ts  srs.ts  anki.ts     # parse PGN, thuật toán SM-2, xuất Anki
  providers/embed.ts                    # Lớp trừu tượng provider video (quan trọng)
  queries/  catalog.ts learning.ts videos.ts   # Truy vấn Supabase
  supabase/ client.ts server.ts middleware.ts  # 3 loại Supabase client
  types/database.ts                     # Type sinh từ schema Supabase
  utils.ts

contexts/     providers.tsx  sidebar-context.tsx
supabase/migrations/0001_video_platform.sql    # Toàn bộ schema + RLS
proxy.ts      # Middleware Next 16 (refresh session Supabase)
```

---

## 5. Cơ sở dữ liệu (Supabase / Postgres)

**QUY ƯỚC SỐNG CÒN: mọi bảng dùng tiền tố `vt_`** (viết tắt video/tube) để **cô lập** với các
bảng ERP/Payload có thể tồn tại chung trong cùng project Supabase. Đừng tạo bảng không có tiền tố này.

Schema gốc: `supabase/migrations/0001_video_platform.sql`. Sửa schema = **thêm migration mới**
(`0002_*.sql`, `0003_*.sql`...), KHÔNG sửa migration cũ đã chạy. Sau khi đổi schema, cập nhật
`lib/types/database.ts` cho khớp.

### Nhóm bảng

- **Nội dung video**: `vt_profiles` (gắn `auth.users`, có `role` admin/viewer), `vt_channels`,
  `vt_categories`, `vt_videos` (provider-agnostic, có `search_tsv` full-text), `vt_playlists`,
  `vt_playlist_items`.
- **Tương tác người xem** (thiết kế sẵn, giai đoạn sau mới bật cho viewer): `vt_comments`,
  `vt_video_likes`, `vt_subscriptions`, `vt_watch_history`.
- **Học tập (PGN/lessons)**: `vt_pgn_games`, `vt_lessons`, `vt_lesson_chapters` (gắn `pgn` +
  `video_timestamp` để đồng bộ bàn cờ với mốc video), `vt_drill_sets`, `vt_srs_cards`
  (`fen` + `expected_move`), `vt_srs_reviews` (per-user, SM-2), `vt_drill_attempts`.

### Bảo mật (RLS) — RẤT QUAN TRỌNG

- RLS **bật trên mọi bảng**. Nội dung công khai chỉ đọc khi `status = 'published'`; admin toàn quyền.
- Helper: `public.vt_is_admin()` đọc `role` của user hiện tại. Policy ghi đều dựa vào hàm này.
- Khi thêm bảng mới: **luôn** `enable row level security` + thêm policy đọc/ghi tương ứng.
- RPC `vt_increment_video_views(uuid)` tăng lượt xem (security definer).
- **Giai đoạn 1**: chỉ tài khoản admin. Các bảng người xem chỉ admin thao tác; chưa mở đăng ký viewer.

---

## 6. Hệ thống provider video (`lib/providers/embed.ts`)

Lớp trừu tượng cho phép một `vt_videos` đến từ nhiều nguồn. Hàm chính:

- `toEmbedUrl(source)` → URL `<iframe>` (gdrive/onedrive/youtube).
- `toPlaybackUrl(source)` → URL HLS `.m3u8` (bunny/cloudflare) cho player `hls.js`.
- `toThumbnailUrl(source)` → suy ra thumbnail theo provider.
- `usesIframe(provider)` → true nếu dùng iframe thay vì player HLS.

**Thêm provider mới = thêm 1 `case`** trong các hàm trên (không sửa logic chỗ khác).
Cấu hình CDN đặt ở biến môi trường `NEXT_PUBLIC_*`; có thể để trống lúc đầu (Drive/YouTube không cần).

---

## 7. Học tập & SRS

- `lib/chess/pgn.ts`: `parsePgnTags()` lấy 7 tag chuẩn; `getMoveList()` trả `{startFen, moves[]}`
  (mỗi nước kèm `fen`, `from`, `to`, `san`) để điều hướng bàn cờ.
- `lib/chess/srs.ts`: `sm2(prev, quality)` — thuật toán **SuperMemo-2**, `quality 0..5` (≥3 là nhớ được),
  trả `interval/ease/repetitions/dueAt`.
- `components/chess/pgn-trainer.tsx`: chế độ drill kiểu *Chess-PGN-Trainer* — máy đi nước đối phương,
  người học đoán nước của mình, chấm đúng/sai, đếm lỗi & thời gian.
- `app/api/export/anki/route.ts`: GET `?drill=<id>` hoặc `?lesson=<id>` → xuất TSV (FEN ⇒ nước đúng) nạp vào Anki.

---

## 8. Supabase clients

- `lib/supabase/server.ts` — dùng trong Server Components / Server Actions / Route Handlers.
- `lib/supabase/client.ts` — dùng trong Client Components (`'use client'`).
- `lib/supabase/middleware.ts` — refresh session, gọi từ `proxy.ts`.

Quy tắc: thao tác ghi/đọc nhạy cảm chạy ở **server** (Server Action trong `actions.ts`), không lộ
quyền ghi ra client. Truy vấn đọc danh mục/video gom trong `lib/queries/`.

---

## 9. Biến môi trường (`.env.local` — KHÔNG commit)

Tên biến (giá trị giữ bí mật, đã được `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID
NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME
NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN
BUNNY_STREAM_API_KEY          # chỉ server, KHÔNG để lộ client
CLOUDFLARE_STREAM_API_TOKEN   # chỉ server
CLOUDFLARE_ACCOUNT_ID         # chỉ server
```

`.env*` đã nằm trong `.gitignore`. Tuyệt đối không in/commit secret. Biến không `NEXT_PUBLIC_`
chỉ được đọc ở phía server.

---

## 10. Nhận diện thương hiệu Dương Sinh

Mọi giao diện hướng tới bộ nhận diện: **màu chủ đạo `#2B3990` (navy) + gold**, font **Roboto**
(in ấn: Calibri), họa tiết **ô vuông cờ vua**, logo Dương Sinh, slogan **"Vui trí tuệ"**.

> **TODO branding**: hiện `app/layout.tsx` vẫn dùng font Geist và metadata "TylooTube"; `README.md`
> còn là bản gốc. Khi rebrand: đổi title/description, áp màu `#2B3990`, font Roboto, favicon/logo Dương Sinh.

---

## 11. Quy ước khi viết code

- **Comment & chuỗi UI bằng tiếng Việt**, kèm thuật ngữ cờ vua/tiếng Anh khi cần (PGN, FEN, SAN, SRS...).
- TypeScript chặt; ưu tiên Server Components, chỉ `'use client'` khi cần tương tác.
- Server Actions đặt trong `actions.ts` cạnh route tương ứng.
- Giữ **tiền tố `vt_`** cho bảng; thêm provider = thêm `case` trong `embed.ts`; đổi schema = migration mới + cập nhật `database.ts`.
- Theo Prettier/ESLint của repo trước khi commit.
- Dùng `pnpm`, không trộn package manager.

---

## 12. Lộ trình (gợi ý)

- **Giai đoạn 1 (hiện tại)**: khu admin CRUD video/kênh/danh mục/playlist + học tập (PGN/bài học/drill);
  chỉ tài khoản admin; phát video đa nguồn; xuất Anki.
- **Giai đoạn 2**: mở tài khoản người xem (viewer) — bật policy RLS cho comments/likes/subscriptions/
  watch_history; tiến độ học cá nhân (SRS per-user); rebrand Dương Sinh hoàn chỉnh.
- **Giai đoạn 3**: tích hợp sâu hệ sinh thái Dương Sinh (gắn lộ trình 6 cấp, kho sách, giải đấu).
