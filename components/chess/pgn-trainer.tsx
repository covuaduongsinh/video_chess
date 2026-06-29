'use client'

import { Button } from '@/components/ui/button'
import { getMoveList } from '@/lib/chess/pgn'
import { Chess } from 'chess.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'

/**
 * Chế độ luyện tập (drill): máy đi nước đối phương, người học đi nước của mình.
 * Chấm đúng/sai, đếm số lỗi và thời gian. (Chess-PGN-Trainer style)
 *
 * Bọc ngoài giữ `resetKey`: khi bấm "Làm lại" hoặc đổi PGN, ta đổi `key` để remount
 * vòng luyện (`DrillRound`) → state khởi tạo lại sạch, không cần effect reset thủ công.
 */
export function PgnTrainer({ pgn, orientation = 'white' }: { pgn: string; orientation?: 'white' | 'black' }) {
  const [resetKey, setResetKey] = useState(0)
  return (
    <DrillRound
      key={`${pgn}::${resetKey}`}
      pgn={pgn}
      orientation={orientation}
      onReset={() => setResetKey((k) => k + 1)}
    />
  )
}

function DrillRound({
  pgn,
  orientation,
  onReset
}: {
  pgn: string
  orientation: 'white' | 'black'
  onReset: () => void
}) {
  const { startFen, moves } = useMemo(() => getMoveList(pgn), [pgn])
  const heroColor = orientation === 'white' ? 'w' : 'b'

  const gameRef = useRef(new Chess(startFen))
  const [fen, setFen] = useState(startFen)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState(0)
  const [startedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)

  // Hoàn thành = đã đi hết nước (state dẫn xuất, không lưu riêng).
  const done = moves.length > 0 && step >= moves.length

  // đồng hồ
  useEffect(() => {
    if (done) return
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(t)
  }, [done, startedAt])

  // máy tự đi nước đối phương (setState chỉ trong callback setTimeout — không đồng bộ trong effect)
  useEffect(() => {
    if (step >= moves.length) return
    const next = moves[step]
    if (next.color !== heroColor) {
      const t = setTimeout(() => {
        gameRef.current.move({ from: next.from, to: next.to, promotion: 'q' })
        setFen(gameRef.current.fen())
        setStep((s) => s + 1)
      }, 450)
      return () => clearTimeout(t)
    }
  }, [step, moves, heroColor])

  function onPieceDrop({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) {
    if (done || !targetSquare) return false
    const expected = moves[step]
    if (!expected || expected.color !== heroColor) return false

    if (sourceSquare === expected.from && targetSquare === expected.to) {
      gameRef.current.move({ from: expected.from, to: expected.to, promotion: 'q' })
      setFen(gameRef.current.fen())
      setStep((s) => s + 1)
      return true
    }
    setErrors((e) => e + 1)
    return false
  }

  const isHeroTurn = !done && step < moves.length && moves[step]?.color === heroColor

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between text-sm'>
        <span>
          Lỗi: <b>{errors}</b>
        </span>
        <span>
          Thời gian: <b>{elapsed}s</b>
        </span>
        <Button variant='secondary' size='sm' onClick={onReset}>
          Làm lại
        </Button>
      </div>

      <div className='mx-auto w-full max-w-[520px]'>
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            allowDragging: isHeroTurn,
            onPieceDrop,
            id: 'trainer'
          }}
        />
      </div>

      {done ? (
        <div className='rounded-md bg-green-500/15 p-3 text-center text-sm'>
          🎉 Hoàn thành! Số lỗi: <b>{errors}</b> • Thời gian: <b>{elapsed}s</b>
        </div>
      ) : (
        <p className='text-secondary-foreground text-center text-sm'>
          {moves.length === 0
            ? 'Không có nước đi để luyện.'
            : isHeroTurn
              ? 'Đến lượt bạn — hãy đi nước đúng.'
              : 'Đối phương đang đi...'}
        </p>
      )}
    </div>
  )
}
