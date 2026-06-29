/**
 * Lớp điều khiển player đa-backend (provider-agnostic).
 * Cho phép component cha tua (seek) và đọc thời gian phát mà không cần biết
 * video đến từ provider nào (HLS <video>, YouTube IFrame API, ...).
 */
export interface PlayerController {
  /** false với provider không cho JS điều khiển (gdrive/onedrive). */
  isControllable: boolean
  /** Tua tới mốc giây. */
  seek(seconds: number): void
  /** Thời gian đang phát (giây). */
  getCurrentTime(): number
  play(): void
  pause(): void
}

/** Mốc đồng bộ: tại giây `t` thì bàn cờ ở vị trí `idx` (0 = thế đầu, i = sau nước i). */
export type MoveCue = { idx: number; t: number }

/** Controller "rỗng" cho provider không điều khiển được — mọi thao tác là no-op. */
export const NOOP_CONTROLLER: PlayerController = {
  isControllable: false,
  seek: () => {},
  getCurrentTime: () => 0,
  play: () => {},
  pause: () => {}
}
