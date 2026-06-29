import { describe, expect, it } from 'vitest'
import { generateCards, getMoveList, isValidPgn, parsePgnTags } from './pgn'

const SIMPLE = '1. e4 e5 2. Nf3 Nc6'
const WITH_TAGS = '[White "Magnus"]\n[Black "Hikaru"]\n[Result "1-0"]\n[ECO "C50"]\n\n1. e4 e5 1-0'

describe('getMoveList', () => {
  it('trả về danh sách nước đi kèm FEN', () => {
    const { moves } = getMoveList(SIMPLE)
    expect(moves).toHaveLength(4)
    expect(moves[0]).toMatchObject({ san: 'e4', from: 'e2', to: 'e4', color: 'w' })
    expect(moves[1]).toMatchObject({ san: 'e5', color: 'b' })
    expect(moves[0].fen).toContain(' b ') // sau e4 đến lượt Đen
  })

  it('PGN rỗng → danh sách rỗng, startFen là thế bắt đầu', () => {
    const { moves, startFen } = getMoveList('')
    expect(moves).toHaveLength(0)
    expect(startFen).toContain('rnbqkbnr')
  })
})

describe('generateCards', () => {
  it('orientation white → chỉ nước Trắng', () => {
    const cards = generateCards(SIMPLE, 'white')
    expect(cards.map((c) => c.expectedMove)).toEqual(['e4', 'Nf3'])
    expect(cards[0].fen).toContain(' w ') // thế trước nước Trắng đầu tiên
  })

  it('orientation black → chỉ nước Đen', () => {
    const cards = generateCards(SIMPLE, 'black')
    expect(cards.map((c) => c.expectedMove)).toEqual(['e5', 'Nc6'])
  })
})

describe('parsePgnTags', () => {
  it('trích đúng 7 tag chuẩn', () => {
    const tags = parsePgnTags(WITH_TAGS)
    expect(tags.white).toBe('Magnus')
    expect(tags.black).toBe('Hikaru')
    expect(tags.result).toBe('1-0')
    expect(tags.eco).toBe('C50')
  })
})

describe('isValidPgn', () => {
  it('PGN hợp lệ → true', () => {
    expect(isValidPgn(SIMPLE)).toBe(true)
  })
})
