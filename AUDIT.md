# Báo cáo Đánh giá Tổng thể — Dự án Video Chess (Cờ vua Dương Sinh)

> **Ảnh chụp:** commit `da57f0d` ("Đợt 5 — hệ sinh thái Dương Sinh"), 30/06/2026.
> **Quy mô:** ~80 file TS/TSX, ~5.555 dòng, 3 migration (15+ bảng `vt_`), có test + CI.
> Tài liệu đi kèm: `ROADMAP.md` (kế hoạch tiến lên từ đây).

> ⚠️ **Lưu ý:** Khi rà soát, repo đang được phát triển rất nhanh (working tree còn nhiều thay đổi chưa commit). Báo cáo này đánh giá theo **bản đã commit `da57f0d`** để có mốc ổn định; vài chi tiết dòng-lệnh có thể đã đổi sau đó. Khi đợt sửa hiện tại commit xong, nên rà soát lại lần cuối.

---

## 1. Tóm tắt điều hành

Video Chess đã vượt xa giai đoạn MVP. Chỉ trong thời gian ngắn, dự án đi qua **6 đợt phát triển có kỷ luật** (Đợt 0 → Đợt 5), mỗi đợt một merge sạch:

- **Đợt 0** — dọn nền & lưới an toàn (test + CI + error boundaries).
- **Đợt 1** — rebrand Dương Sinh & SEO.
- **Đợt 2** — mở tài khoản học viên (Phase 2).
- **Đợt 3** — SRS ôn tập ngay trong app.
- **Đợt 4** — production hardening.
- **Đợt 5** — hệ sinh thái: lộ trình 6 cấp + giải đấu.

Kết quả: phần lớn các khuyến nghị của bản đánh giá đầu đã **được thực hiện**. Nền tảng kỹ thuật vốn đã tốt nay được bổ sung đúng các mảnh còn thiếu: **thương hiệu, SEO, tài khoản người xem, SRS cá nhân hoá, kiểm thử/CI, và lộ trình 6 cấp + giải đấu**. Đây là một sản phẩm **gần sẵn sàng vận hành công khai**.

Việc còn lại không còn là "xây phần lõi" mà là **gọt cạnh để đưa vào sản xuất và bắt đầu tạo doanh thu**: vá nốt một lỗ hổng bảo mật nhỏ, thêm giám sát/analytics, nhập nội dung hàng loạt, và dựng mô hình doanh thu. Xem điểm chi tiết ở Mục 7.

**Mức độ sẵn sàng (ước lượng):** Admin/CMS ~95% · Trải nghiệm người xem ~85% · Sẵn sàng tăng trưởng (brand/SEO/account) ~85% · Sẵn sàng doanh thu ~20%.

---

## 2. Bức tranh tổng thể

| Hạng mục | Hiện trạng (commit da57f0d) |
|---|---|
| Quy mô code | ~80 file `.ts/.tsx`, ~5.555 dòng |
| Nền tảng | Next.js 16.1.4 (App Router, Turbopack), React 19.2, TS 5, Tailwind v4, shadcn/ui |
| Dữ liệu | Supabase Postgres, 3 migration: `0001` nền tảng · `0002` viewer · `0003` ecosystem |
| Tài khoản | **Admin + Viewer** (đăng ký/đăng nhập học viên, tự tạo hồ sơ qua trigger) |
| Kiểm thử | **Có** — 4 bộ test (`srs`, `pgn`, `anki`, `embed`) chạy bằng Vitest |
| CI/CD | **Có** — GitHub Actions: lint + typecheck + test + build |
| Resilience | `error.tsx`, `global-error.tsx`, `loading.tsx`, `not-found.tsx` |
| SEO | `sitemap.ts` động, `robots.ts`, `generateMetadata` ở 4 route, OpenGraph |
| Thương hiệu | Áp xong: Roboto (subset `vietnamese`), `#2B3990` + gold, metadata "Cờ vua Dương Sinh" |

---

## 3. Những việc ĐÃ LÀM ĐƯỢC (cập nhật)

### 3.1 Nền tảng & chất lượng (Đợt 0, 4)
- **Kiểm thử** logic cờ vua: `lib/chess/srs.test.ts`, `pgn.test.ts`, `anki.test.ts`, `lib/providers/embed.test.ts` — bảo vệ đúng các chỗ dễ sai nhất (SM-2, sinh thẻ, parse).
- **CI** (`.github/workflows/ci.yml`): mỗi PR chạy `pnpm lint` + `pnpm typecheck` (`tsc --noEmit`) + `pnpm test` + `pnpm build`.
- **Lưới an toàn runtime**: error/global-error/loading/not-found boundaries.
- `package.json name` đổi thành `video-chess`; có `.env.example`; script `typecheck`/`test`/`test:watch`.

### 3.2 Thương hiệu & SEO (Đợt 1)
- Font **Roboto** kèm subset `vietnamese`; biến màu `--primary` = `#2B3990` (navy), `--accent` = gold, có biến thể dark mode.
- Metadata toàn site (title template `%s | Cờ vua Dương Sinh`, description, keywords, authors, OpenGraph, `metadataBase`).
- **SEO động**: `sitemap.ts` gom video/bài học/kênh/giải đấu đã publish; `robots.ts` chặn `/admin` `/api`; `generateMetadata` ở `/watch`, `/learn/[slug]`, `/channel/[slug]`, `/tournaments/[slug]`.

### 3.3 Tài khoản học viên (Đợt 2)
- `app/(auth)/login`, `register`, layout riêng; `components/user-menu.tsx`.
- Migration `0002_viewer.sql`: trigger `vt_handle_new_user` tự tạo `vt_profiles` (role `viewer`) khi đăng ký; policy RLS cho viewer thao tác dữ liệu của chính mình (comments pending review, likes, watch_history, srs_reviews...).
- Middleware cập nhật: phân tách khu vực cần đăng nhập vs khu admin.

### 3.4 SRS ôn tập trong app (Đợt 3)
- `app/learn/review` (+ `actions.ts`) và `components/chess/srs-review.tsx`: hàng đợi thẻ đến hạn theo SM-2 **của riêng người học**, ghi nhận chất lượng nhớ — mắt xích cá nhân hoá trước đây bị khoá nay đã thông.
- `app/me/page.tsx`: trang cá nhân/tiến độ.

### 3.5 Hệ sinh thái: lộ trình 6 cấp + giải đấu (Đợt 5)
- Migration `0003_ecosystem.sql`: thêm cột `level` vào `vt_lessons` (`tot|ma|tuong|xe|hau|vua`) và bảng `vt_tournaments` (RLS công khai đọc, admin ghi).
- `app/learn/roadmap/page.tsx`: "đường học" 6 cấp trực quan, nhóm bài học theo `level`.
- `app/tournaments` (công khai) + `app/admin/(dashboard)/tournaments` (CRUD) + `lib/queries/tournaments.ts`; admin-nav đã có mục "Giải đấu".

### 3.6 Nền tảng cốt lõi (giữ nguyên từ trước, vẫn vững)
- Video provider-agnostic (5 nguồn) + player HLS/iframe/mp4; CSDL PGN + xem ván tương tác; drill PGN-Trainer; xuất Anki; CMS đầy đủ; RLS toàn diện; tiền tố `vt_`. (Chi tiết kỹ thuật xem `CLAUDE.md`.)

---

## 4. Ưu điểm & tính ưu việt

1. **Năng lực thực thi xuất sắc.** Đi từ "YouTube clone" tới "nền tảng học cờ có hệ sinh thái" qua 6 đợt merge sạch, có kiểm thử và CI — nhịp độ và kỷ luật hiếm có ở dự án một người.
2. **Vòng giá trị đã thông suốt.** "Xem video → lật ván mẫu → drill → **SRS cá nhân hoá** → Anki", nay cộng thêm **lộ trình 6 cấp** làm khung tiến bộ và **giải đấu** làm điểm chạm cộng đồng. Đây là chuỗi mà YouTube/Chess.com không gộp trong một luồng cho trẻ em Việt.
3. **Nền móng kỹ thuật đúng và bền:** RLS toàn diện, tiền tố `vt_`, provider abstraction, 3 loại Supabase client, validate phía server — cộng nay có **lưới an toàn** (test + CI) để sửa đổi không gây hồi quy.
4. **Khớp định hướng "Vui trí tuệ":** SRS + lộ trình 6 cấp phục vụ đúng mục tiêu *phát triển tư duy & ghi nhớ bền vững*, ưu tiên phong trào hơn thành tích.

---

## 5. Vấn đề tồn tại cần khắc phục (đã thu hẹp đáng kể)

### 🔴 P0 — cần xử lý sớm
**5.1 Lỗ hổng injection ở tìm kiếm PGN (vẫn còn ở bản commit).**
`lib/queries/learning.ts` → `getPgnGames` vẫn ghép input vào `.or(\`white.ilike.%${search}%...\`)`. Ký tự `,()*` trong từ khoá có thể phá filter PostgREST. → *Ghi nhận: đợt sửa đang diễn ra trên working tree có vẻ đang chạm đúng hàm này — cần xác nhận đã làm sạch input + thêm test ca biên.*

### 🟠 P1 — trước khi mở rộng & tạo doanh thu
**5.2 Chưa có analytics & giám sát lỗi production.** Không thấy Plausible/Umami/PostHog; chưa tích hợp Sentry thực sự. → Không đo được tăng trưởng/giữ chân, không biết lỗi runtime ngoài thực địa. Cần analytics tôn trọng quyền riêng tư trẻ em + Sentry.
**5.3 Pipeline nội dung còn thủ công.** Nhập PGN/bài học từng cái; chưa có **nhập hàng loạt** và chưa nối với nguồn soạn (Obsidian/Arkon). → Rủi ro "nền tảng đẹp nhưng thiếu nội dung". Cần bulk import + (về sau) Obsidian → DB.
**5.4 Chưa có email/nhắc ôn theo lịch SRS.** Giá trị SRS phụ thuộc việc kéo người học quay lại — hiện chưa có cron/email. → Thêm nhắc "đến giờ ôn cờ".

### 🟡 P2 — nợ kỹ thuật & hoàn thiện
**5.5 Phân trang & cache** cho trang chủ/tìm kiếm/PGN (còn `limit(200)` cứng) khi thư viện lớn.
**5.6 Type DB viết tay** — nên `supabase gen types` tự động để tránh lệch sau mỗi migration.
**5.7 Kiểm thử mới phủ `lib/chess/*`** — nên mở rộng sang `lib/queries/*` và một vài luồng E2E (đăng ký → học → ôn).
**5.8 Xác minh chất lượng các trang Đợt 2–5** (review, me, roadmap, tournaments) về empty-state, phân quyền, hiển thị mobile — cần QA thực tế.

### ⚪ Chưa có (theo kế hoạch Giai đoạn sau)
**5.9 Monetization** — chưa có khoá học trả phí/membership/thanh toán VN (VNPay/MoMo). **5.10 Landing brand cho phụ huynh** (phễu chuyển đổi). **5.11 App/PWA + push.**

---

## 6. Đánh giá theo chiều kinh doanh / sản phẩm

Định vị vẫn đúng và nay được củng cố: **"học cờ có lộ trình, ghi nhớ bền vững, cho trẻ em Việt"**. Với lộ trình 6 cấp đã lên app, sản phẩm có **khung tiến bộ rõ ràng** để truyền thông cho phụ huynh ("con bạn đang ở cấp Tốt, mục tiêu lên Mã").

Hai đòn bẩy lớn của bản đánh giá trước **đã được kích hoạt**: (1) tài khoản người xem + SRS cá nhân hoá — thông vòng giữ chân; (2) thương hiệu + SEO — mở đường discovery. Vì vậy trọng tâm chiến lược **chuyển từ "xây tính năng" sang "tăng trưởng + doanh thu + nội dung"**:
- **Nội dung là nút thắt mới.** Cần đổ bài học/ván mẫu vào nhanh (bulk import + pipeline Obsidian) để 6 cấp có "ruột".
- **Doanh thu là khoảng trống lớn nhất còn lại.** Nền tảng đã đủ chín để thử nghiệm membership hoặc khoá học trả phí gắn lộ trình 6 cấp.
- **Đo lường để tối ưu.** Có analytics mới biết phụ huynh dừng ở đâu trong phễu đăng ký → học → ôn.

---

## 7. Scorecard (cập nhật so với bản đầu)

| Tiêu chí | Trước | Nay | Ghi chú |
|---|:--:|:--:|---|
| Kiến trúc & chất lượng code | 9 | 9 | Giữ vững, thêm test/CI |
| CSDL & bảo mật RLS | 9 | 8.5 | Toàn diện; trừ vì injection PGN chưa xác nhận vá |
| Hệ video đa nguồn | 9 | 9 | — |
| Học tập / SRS (giá trị lõi) | 8 | 9 | Đã cá nhân hoá (review + /me) |
| CMS / Admin | 8 | 9 | Thêm giải đấu; còn thiếu nhập lô |
| Trải nghiệm người xem | 6 | 8 | Có auth, boundaries, user-menu; cần QA |
| Nhận diện thương hiệu | 3 | 9 | Áp xong Roboto + #2B3990 + metadata |
| SEO / tăng trưởng | 1 | 8 | Sitemap/robots/OG/metadata; thiếu analytics |
| Kiểm thử / CI / giám sát | 1 | 6.5 | Có test + CI; thiếu monitoring/analytics |
| Sẵn sàng monetization | 2 | 2 | Chưa có mô hình/thanh toán |
| **Tổng quan** | **~6.5** | **~8.0** | Lõi & vòng ngoài đã chín; còn doanh thu + nội dung + đo lường |

---

## 8. Ba việc nên làm tiếp ngay

1. **Hoàn tất & xác nhận vá injection `getPgnGames`** + thêm test ca biên (P0).
2. **Gắn analytics (Plausible/Umami) + Sentry** để đo phễu và bắt lỗi thực địa (P1).
3. **Nhập PGN/bài học hàng loạt** để 6 cấp có đủ nội dung (P1).

> Kế hoạch chi tiết tiến lên từ Đợt 5 (việc, ưu tiên, ước lượng, DoD, KPI) — xem **`ROADMAP.md`**.
