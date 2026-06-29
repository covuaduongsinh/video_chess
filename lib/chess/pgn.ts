import { Chess } from 'chess.js'

export type PgnTags = {
  white?: string
  black?: string
  result?: string
  eco?: string
  event?: string
  site?: string
  date?: string
}

export type MoveItem = { san: string; fen: string; from: string; to: string; color: 'w' | 'b' }

/** Trích 7 tag chuẩn từ PGN. */
export function parsePgnTags(pgn: string): PgnTags {
  try {
    const chess = new Chess()
    chess.loadPgn(pgn)
    const h = chess.header()
    return {
      white: h.White ?? undefined,
      black: h.Black ?? undefined,
      result: h.Result ?? undefined,
      eco: h.ECO ?? undefined,
      event: h.Event ?? undefined,
      site: h.Site ?? undefined,
      date: h.Date ?? undefined
    }
  } catch {
    return {}
  }
}

/** Danh sách nước đi (kèm FEN sau mỗi nước) để điều hướng bàn cờ. */
export function getMoveList(pgn: string): { startFen: string; moves: MoveItem[] } {
  const chess = new Chess()
  try {
    chess.loadPgn(pgn)
  } catch {
    return { startFen: new Chess().fen(), moves: [] }
  }
  const verbose = chess.history({ verbose: true }) as Array<{
    san: string
    after: string
    before: string
    from: string
    to: string
    color: 'w' | 'b'
  }>
  const startFen = verbose.length > 0 ? verbose[0].before : chess.fen()
  const moves: MoveItem[] = verbose.map((m) => ({
    san: m.san,
    fen: m.after,
    from: m.from,
    to: m.to,
    color: m.color
  }))
  return { startFen, moves }
}

/**
 * Sinh thẻ ôn (SRS) từ PGN cho một phía: với mỗi nước của phía 'hero',
 * thẻ gồm thế cờ trước nước đi (FEN) và nước đi đúng (SAN).
 */
export function generateCards(
  pgn: string,
  orientation: 'white' | 'black'
): Array<{ fen: string; expectedMove: string }> {
  const chess = new Chess()
  try {
    chess.loadPgn(pgn)
  } catch {
    return []
  }
  const heroColor = orientation === 'white' ? 'w' : 'b'
  const verbose = chess.history({ verbose: true }) as Array<{
    san: string
    before: string
    color: 'w' | 'b'
  }>
  return verbose.filter((m) => m.color === heroColor).map((m) => ({ fen: m.before, expectedMove: m.san }))
}

/** Kiểm tra PGN hợp lệ. */
export function isValidPgn(pgn: string): boolean {
  try {
    new Chess().loadPgn(pgn)
    return true
  } catch {
    return false
  }
}
