# Kế hoạch Chiến lược & Triển khai — Video Chess (Cờ vua Dương Sinh)

> Đi kèm `AUDIT.md`. Mốc xuất phát: commit `da57f0d` ("Đợt 5"). Đợt 0–5 (dọn nền, rebrand+SEO, tài khoản học viên, SRS trong app, hardening, lộ trình 6 cấp + giải đấu) **đã hoàn thành**. Tài liệu này vạch đường **từ Đợt 5 trở đi**.
> Quy ước: P0 = làm ngay · P1 = cao · P2 = trung bình · P3 = về sau. Ước lượng "ngày-người" (nd) cho 1 lập trình viên.

---

## 1. Định hướng chiến lược (đã cập nhật)

Phần lõi sản phẩm đã xong. **Trọng tâm chuyển từ "xây tính năng" sang ba việc:**

1. **Đổ nội dung** — biến lộ trình 6 cấp và CSDL PGN thành kho bài thực chất (bulk import + pipeline Obsidian). *Đây là nút thắt giá trị mới.*
2. **Tạo doanh thu** — thử nghiệm membership/khoá học trả phí gắn lộ trình 6 cấp; tích hợp thanh toán VN. *Khoảng trống lớn nhất còn lại.*
3. **Đo & tối ưu** — analytics + giám sát để biết phụ huynh dừng ở đâu trong phễu "đăng ký → học → ôn", rồi tối ưu giữ chân.

Song song: **gọt cạnh production** (vá bảo mật, QA các trang mới, mở rộng test) để mở công khai an toàn.

---

## 2. Lộ trình theo giai đoạn (từ Đợt 5)

### 🟥 Đợt 6 — "Gọt cạnh & sẵn sàng công khai" (Tuần này, ~3–4 nd)
*Mục tiêu: an toàn, đo được, đủ tự tin mở cho người dùng thật.*

| # | Việc | Ưu tiên | Công | Vị trí | DoD |
|---|---|:--:|:--:|---|---|
| 6.1 | **Vá & xác nhận injection PGN** | P0 | 0.25 nd | `lib/queries/learning.ts` → `getPgnGames` | Làm sạch/escape input (`,()*`); thêm test ca từ khoá có ký tự đặc biệt không phá truy vấn |
| 6.2 | **Analytics tôn trọng quyền riêng tư** | P1 | 0.5 nd | `app/layout.tsx` | Gắn Plausible/Umami (không cookie theo dõi trẻ em); xem được lượt truy cập theo trang |
| 6.3 | **Giám sát lỗi production (Sentry)** | P1 | 0.5 nd | cấu hình + `error.tsx`/`global-error.tsx` | Lỗi runtime thực địa được báo về dashboard |
| 6.4 | **QA các trang Đợt 2–5** | P1 | 1 nd | `(auth)`, `learn/review`, `me`, `learn/roadmap`, `tournaments` | Kiểm empty-state, phân quyền viewer/admin, hiển thị mobile; sửa lỗi phát hiện |
| 6.5 | **Mở rộng test sang `lib/queries/*`** | P2 | 1 nd | thêm test | Phủ thêm truy vấn chính (videos, learning, tournaments); CI vẫn xanh |
| 6.6 | **Sinh type DB tự động** | P2 | 0.5 nd | script `pnpm db:types` | `supabase gen types` cập nhật `lib/types/database.ts`; ghi vào CLAUDE.md |

### 🟦 Đợt 7 — "Đổ nội dung" (1–2 tuần, ~5–6 nd)
*Mục tiêu: 6 cấp và CSDL PGN có "ruột"; đưa bài học vào nhanh.*

| # | Việc | Ưu tiên | Công | Vị trí | DoD |
|---|---|:--:|:--:|---|---|
| 7.1 | **Nhập PGN hàng loạt** | P1 | 1.5 nd | `app/admin/(dashboard)/pgn/` | Dán/đính kèm file nhiều ván → tách & lưu từng ván; báo cáo ok/lỗi |
| 7.2 | **Gán `level` khi soạn bài học** | P1 | 0.5 nd | `app/admin/(dashboard)/lessons/` | Form bài học chọn cấp (Tốt→Vua); roadmap tự cập nhật |
| 7.3 | **Phân trang + cache trang đọc** | P2 | 1.5 nd | `app/page.tsx`, `search`, `getPgnGames` | Phân trang (cursor/`range`); bỏ `limit(200)`; đặt `revalidate` cho trang đọc nhiều |
| 7.4 | **Pipeline Obsidian → DB (bán tự động)** | P2 | 2 nd | script import | Markdown bài học trong vault OBSIDIAN2026 → `vt_lessons` + `vt_lesson_chapters`; chạy lệnh là vào |
| 7.5 | **Email nhắc ôn theo lịch SRS** | P2 | 1.5 nd | cron + Resend/Supabase | "Đến giờ ôn cờ — X thẻ đến hạn"; kéo người học quay lại |

### 🟩 Đợt 8 — "Doanh thu" (2–4 tuần, ~8–10 nd)
*Mục tiêu: bắt đầu thu được tiền, gắn với lộ trình 6 cấp.*

| # | Việc | Ưu tiên | Công | Ghi chú/DoD |
|---|---|:--:|:--:|---|
| 8.1 | **Landing brand cho phụ huynh** | P1 | 2 nd | Trang giới thiệu giá trị + lộ trình + CTA đăng ký; phễu chuyển đổi, không chỉ grid video |
| 8.2 | **Mô hình hội viên / khoá học trả phí** | P1 | 3 nd | Đánh dấu bài học/video "hội viên"; RLS theo gói; migration `0004` cho `vt_memberships`/`vt_entitlements` |
| 8.3 | **Tích hợp thanh toán VN** | P1 | 3 nd | VNPay/MoMo/chuyển khoản; webhook xác nhận → cấp quyền; thử nghiệm sandbox |
| 8.4 | **Trang quản lý gói & doanh thu (admin)** | P2 | 1.5 nd | Theo dõi đăng ký, gia hạn, doanh thu cơ bản |

### 🟪 Đợt 9+ — "Mở rộng hệ sinh thái" (Quý sau, theo đợt)
| # | Việc | Ưu tiên | Ghi chú |
|---|---|:--:|---|
| 9.1 | **Đăng ký giải đấu online** | P2 | Mở rộng `vt_tournaments`: form đăng ký, danh sách VĐV, kết quả |
| 9.2 | **Kho sách / hiệu sách cờ vua** | P2 | Trưng bày & bán sách Dương Sinh; nối mảng xuất bản |
| 9.3 | **Huy hiệu & chứng nhận hoàn thành cấp** | P2 | Gamification lộ trình 6 cấp; chứng nhận khi lên cấp |
| 9.4 | **App/PWA + thông báo đẩy** | P3 | Cài lên điện thoại; push nhắc ôn |
| 9.5 | **Cộng đồng: bình luận mở rộng + hỏi đáp** | P3 | Mở dần có kiểm duyệt |

---

## 3. Ma trận ưu tiên (Tác động × Công sức)

```
   Tác động CAO │  6.1 Vá injection      │  8.2 Hội viên trả phí
                │  6.2 Analytics         │  8.3 Thanh toán VN
                │  7.1 Nhập PGN hàng loạt│  7.4 Pipeline Obsidian
                │  7.2 Gán level bài học │  8.1 Landing phụ huynh
   ─────────────┼────────────────────────┼─────────────────────────
   Tác động     │  6.6 Gen types         │  6.5 Test queries
   THẤP–TB      │  6.3 Sentry            │  7.3 Phân trang/cache
                │                        │  9.2 Kho sách
                └────────────────────────┴─────────────────────────
                   Công sức THẤP            Công sức CAO
```
**Đọc ma trận:** quét sạch góc trên-trái trong Đợt 6–7, rồi đầu tư có chọn lọc góc trên-phải (Đợt 8 doanh thu).

---

## 4. Rủi ro & cách giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| **6 cấp/PGN thiếu nội dung** | Cao | Ưu tiên 7.1 + 7.4; đặt mục tiêu số bài/ván mỗi tuần |
| **Dữ liệu & quyền riêng tư trẻ em** | Cao | Tài khoản do phụ huynh quản; analytics không cookie theo dõi; tối thiểu hoá dữ liệu; điều khoản rõ |
| **Một người gánh dev + nội dung + KD** | Cao | Bám thứ tự P0→P3; tự động hoá (gen types, bulk import, pipeline); dùng AI hỗ trợ soạn |
| **Repo sửa song song nhiều phiên** | TB | Commit nhỏ + CI bắt buộc xanh; tránh để working tree dở lâu; review diff trước merge |
| **Thanh toán/hoàn tiền sai** | TB | Dùng sandbox trước; webhook idempotent; đối soát thủ công giai đoạn đầu |
| **Chi phí hạ tầng theo video** | TB | Provider-agnostic: Drive/YouTube cho phổ thông, Bunny/Cloudflare cho nội dung hội viên |

---

## 5. KPI đo lường thành công

**Kỹ thuật/vận hành:** CI xanh 100%; độ phủ test mở rộng sang `lib/queries/*`; 0 lỗi nghiêm trọng/tuần (Sentry); Lighthouse SEO/Perf ≥ 90.

**Sản phẩm/kinh doanh:**
- Số trang Google index tăng đều (discovery).
- Tỉ lệ khách → tạo tài khoản; tỉ lệ tài khoản → có ≥1 phiên ôn SRS.
- Giữ chân 7 ngày & "học sinh ôn mỗi ngày" (nhờ SRS + email nhắc).
- Số bài học/ván PGN xuất bản mỗi tuần (sức khoẻ nội dung); độ phủ bài theo từng cấp 6 cấp.
- (Đợt 8) Số hội viên trả phí & tỉ lệ chuyển đổi từ nền tảng sang khoá học/CLB.

---

## 6. Hành động ngay tuần này (Top 5)

1. **6.1** Vá & xác nhận injection `getPgnGames` + test ca biên *(0.25 nd)*.
2. **6.2** Gắn analytics tôn trọng quyền riêng tư *(0.5 nd)*.
3. **6.3** Tích hợp Sentry bắt lỗi production *(0.5 nd)*.
4. **6.4** QA các trang Đợt 2–5 (auth, review, me, roadmap, tournaments) *(1 nd)*.
5. **7.1** Khởi động nhập PGN hàng loạt để đổ nội dung *(bắt đầu 1.5 nd)*.

> Khi Thầy muốn, tôi có thể **bắt tay làm trực tiếp** từng việc P0/P1 ở Đợt 6 ngay trong repo — nhưng nên đợi đợt sửa hiện tại trên working tree commit xong để tránh xung đột.
