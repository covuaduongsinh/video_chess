import { describe, expect, it } from 'vitest'
import { toAnkiTsv } from './anki'

const WHITE_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const BLACK_FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'

describe('toAnkiTsv', () => {
  it('có header Anki đúng định dạng', () => {
    const out = toAnkiTsv([{ fen: WHITE_FEN, expectedMove: 'e4' }])
    expect(out.startsWith('#separator:tab\n#html:false\n')).toBe(true)
  })

  it('mặt trước hiển thị bên đến lượt + tab ngăn cách nước đi', () => {
    const out = toAnkiTsv([{ fen: WHITE_FEN, expectedMove: 'e4' }])
    expect(out).toContain('(Trắng đi)')
    expect(out).toContain('\te4')
  })

  it('FEN đến lượt Đen → "Đen đi"', () => {
    const out = toAnkiTsv([{ fen: BLACK_FEN, expectedMove: 'e5' }])
    expect(out).toContain('(Đen đi)')
  })

  it('nhiều thẻ → mỗi thẻ một dòng', () => {
    const out = toAnkiTsv([
      { fen: WHITE_FEN, expectedMove: 'e4' },
      { fen: BLACK_FEN, expectedMove: 'e5' }
    ])
    expect(out.trim().split('\n')).toHaveLength(4) // 2 dòng header + 2 thẻ
  })
})
