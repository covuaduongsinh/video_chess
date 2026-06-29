# Video Chess — Cờ vua Dương Sinh

Nền tảng video kiểu YouTube **chuyên cho cờ vua**, phục vụ hệ sinh thái Công ty CP Cờ vua Dương Sinh
("Vui trí tuệ"). Nền tảng kết hợp 3 mảng:

1. **Video** — phát bài giảng/giải đấu, provider-agnostic (YouTube, Google Drive, Bunny, Cloudflare, OneDrive).
2. **Cơ sở dữ liệu ván cờ (PGN)** — lưu, tra cứu và xem lại ván cờ trên bàn cờ tương tác.
3. **Học tập (Learning)** — bài học gắn chương PGN, bài tập (drill) luyện nước đi, ôn tập theo
   thuật toán lặp lại ngắt quãng SRS (SM-2), xuất thẻ sang Anki.

> Dự án fork từ [`tyloo/tylootube`](https://github.com/tyloo/tylootube) rồi cải tạo thành nền tảng cờ vua.

## Tech stack

- **Next.js 16** (App Router, Turbopack — lưu ý: middleware đổi tên thành `proxy.ts`)
- **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (Radix)
- **Supabase** — Postgres + Auth + Row Level Security (qua `@supabase/ssr`)
- **Cờ vua**: `chess.js`, `react-chessboard`, `@mliebelt/pgn-parser`
- **Video**: `hls.js` (phát HLS `.m3u8` cho Bunny/Cloudflare)
- `next-themes`, `lucide-react`, `zod`
- **Package manager: `pnpm`** (không dùng npm/yarn)

## Bắt đầu

```bash
pnpm install                 # cài dependencies
cp .env.example .env.local   # rồi điền biến môi trường Supabase
pnpm dev                     # chạy dev tại http://localhost:3000
```

## Lệnh thường dùng

```bash
pnpm dev          # chạy dev (Turbopack)
pnpm build        # build production
pnpm start        # chạy bản build
pnpm lint         # ESLint
pnpm typecheck    # kiểm tra kiểu (tsc --noEmit)
pnpm test         # chạy unit test (Vitest)
pnpm format       # Prettier --write
```

## Cấu trúc chính

```
app/        # App Router: trang công khai (watch/search/playlist/channel/learn) + khu admin
components/ # chess/ (board-viewer, pgn-trainer), admin/, learn/, ui/ (shadcn)
lib/        # chess/ (pgn, srs, anki), providers/embed.ts, queries/, supabase/, types/
supabase/migrations/        # schema + RLS (mọi bảng dùng tiền tố vt_)
proxy.ts    # middleware Next 16 (refresh session Supabase)
```

## Cơ sở dữ liệu

Mọi bảng dùng tiền tố **`vt_`** để cô lập với hệ thống khác dùng chung Supabase. Đổi schema =
**thêm migration mới** (`0002_*.sql`...), không sửa migration cũ; sau đó cập nhật `lib/types/database.ts`.
RLS bật trên mọi bảng; nội dung công khai chỉ đọc khi `status = 'published'`, admin toàn quyền.

Xem thêm hướng dẫn chi tiết cho người phát triển tại [`CLAUDE.md`](CLAUDE.md).

## Giấy phép

Xem [LICENSE.md](LICENSE.md).
