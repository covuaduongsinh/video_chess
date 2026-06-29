/**
 * Xuất thẻ sang định dạng TSV mà Anki nhập trực tiếp được
 * (File → Import, phân tách bằng Tab, 2 trường: Mặt trước / Mặt sau).
 * Mặt trước = thế cờ (FEN) + bên đến lượt; Mặt sau = nước đi đúng.
 */
export type AnkiCard = { fen: string; expectedMove: string }

export function toAnkiTsv(cards: AnkiCard[]): string {
  const header = '#separator:tab\n#html:false\n'
  const lines = cards.map((c) => {
    const sideToMove = c.fen.split(' ')[1] === 'b' ? 'Đen đi' : 'Trắng đi'
    const front = `${c.fen} (${sideToMove})`
    return `${front}\t${c.expectedMove}`
  })
  return header + lines.join('\n') + '\n'
}
