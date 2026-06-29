// Cấu hình ESLint flat config cho Next 16 (lệnh `next lint` đã bị gỡ — chạy trực tiếp `eslint .`).
// eslint-config-next v16 xuất sẵn flat config nên không cần FlatCompat nữa.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  { ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**'] },
  ...nextCoreWebVitals,
  ...nextTypescript
]

export default eslintConfig
