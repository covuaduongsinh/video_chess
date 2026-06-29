'use client'

// Ranh giới lỗi cấp gốc — thay thế cả root layout khi layout/template gốc ném lỗi.
// Bắt buộc tự render <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang='vi'>
      <body>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16, textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Đã có lỗi nghiêm trọng</h2>
          <p style={{ maxWidth: 420, fontSize: 14, opacity: 0.8 }}>Xin lỗi, ứng dụng gặp sự cố. Vui lòng tải lại trang.</p>
          <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid currentColor', cursor: 'pointer' }}>
            Thử lại
          </button>
          <p style={{ fontSize: 12, opacity: 0.5 }}>{error.digest}</p>
        </div>
      </body>
    </html>
  )
}
