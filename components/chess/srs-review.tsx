'use client'

import { Button } from '@/components/ui/button'
import { Chess } from 'chess.js'
import { useCallback, useMemo, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { submitSrsReview } from '@/app/learn/review/actions'

type Card = {
  id: string
  fen: string
  expected_move: string
  drill_set_id: string | null
  lesson_id: string | null
}

type Props = { cards: Card[] }

/** Một thẻ SRS — hiện bàn cờ, học viên đi nước, chấm đúng/sai, tự đánh giá quality 1..5. */
export function SrsReview({ cards }: Props) {
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<'waiting' | 'correct' | 'wrong'>('waiting')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const card = cards[index]

  const resultFen = useMemo(() => {
    if (!card) return null
    try {
      const g = new Chess(card.fen)
      const [from, to] = [card.expected_move.slice(0, 2), card.expected_move.slice(2, 4)]
      const promo = card.expected_move[4]
      g.move({ from, to, promotion: promo || 'q' })
      return g.fen()
    } catch {
      return card.fen
    }
  }, [card])

  function onPieceDrop({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) {
    if (status !== 'waiting' || !targetSquare || !card) return false
    const move = sourceSquare + targetSquare
    if (move === card.expected_move.slice(0, 4)) {
      setStatus('correct')
    } else {
      setStatus('wrong')
    }
    return true
  }

  const submitAndNext = useCallback(
    async (quality: number) => {
      if (!card) return
      setSubmitting(true)
      await submitSrsReview(card.id, quality)
      setSubmitting(false)

      if (index + 1 >= cards.length) {
        setDone(true)
      } else {
        setIndex((i) => i + 1)
        setStatus('waiting')
      }
    },
    [card, index, cards.length]
  )

  if (done) {
    return (
      <div className='border-border rounded-lg border p-8 text-center'>
        <p className='text-4xl'>🏆</p>
        <p className='mt-2 font-semibold'>Phiên ôn tập hoàn thành!</p>
        <p className='text-muted-foreground mt-1 text-sm'>Đã ôn {cards.length} thẻ.</p>
        <Button className='mt-4' onClick={() => { setIndex(0); setDone(false); setStatus('waiting') }}>
          Ôn lại
        </Button>
      </div>
    )
  }

  if (!card) return null

  return (
    <div className='flex flex-col gap-4'>
      <div className='text-muted-foreground flex items-center justify-between text-sm'>
        <span>Thẻ {index + 1} / {cards.length}</span>
        <div className='bg-secondary h-2 flex-1 mx-4 rounded-full'>
          <div
            className='bg-primary h-2 rounded-full transition-all'
            style={{ width: `${((index) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className='mx-auto w-full max-w-[480px]'>
        <Chessboard
          options={{
            position: status !== 'waiting' && resultFen ? resultFen : card.fen,
            allowDragging: status === 'waiting',
            onPieceDrop,
            id: 'srs'
          }}
        />
      </div>

      {status === 'waiting' && (
        <p className='text-center text-sm'>Hãy đi nước đúng trên bàn cờ.</p>
      )}

      {status === 'correct' && (
        <div className='rounded-md bg-green-500/15 p-3 text-center'>
          <p className='font-semibold text-green-700 dark:text-green-400'>Đúng! Bạn nhớ mức nào?</p>
          <div className='mt-2 flex justify-center gap-2 flex-wrap'>
            {([
              { q: 1, label: 'Không nhớ', cls: 'destructive' },
              { q: 3, label: 'Khó nhớ', cls: 'secondary' },
              { q: 4, label: 'Nhớ được', cls: 'secondary' },
              { q: 5, label: 'Dễ', cls: 'default' }
            ] as const).map(({ q, label, cls }) => (
              <Button
                key={q}
                variant={cls === 'default' ? 'default' : cls === 'destructive' ? 'destructive' : 'secondary'}
                size='sm'
                disabled={submitting}
                onClick={() => submitAndNext(q)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {status === 'wrong' && (
        <div className='rounded-md bg-red-500/15 p-3 text-center'>
          <p className='font-semibold text-red-700 dark:text-red-400'>Sai rồi — nước đúng đã được hiển thị.</p>
          <Button
            className='mt-2'
            variant='secondary'
            size='sm'
            disabled={submitting}
            onClick={() => submitAndNext(1)}
          >
            Tiếp tục
          </Button>
        </div>
      )}
    </div>
  )
}
