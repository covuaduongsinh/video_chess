import { createTournament } from '../actions'

export default function NewTournamentPage() {
  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Tạo giải đấu</h1>
      <form action={createTournament} className='max-w-lg space-y-4'>
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Tiêu đề *</label>
          <input name='title' required className='border-input w-full rounded-md border px-3 py-2 text-sm' />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Slug *</label>
          <input name='slug' required className='border-input w-full rounded-md border px-3 py-2 text-sm' />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Mô tả</label>
          <textarea name='description' rows={3} className='border-input w-full rounded-md border px-3 py-2 text-sm' />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Ngày bắt đầu</label>
            <input type='date' name='date_start' className='border-input w-full rounded-md border px-3 py-2 text-sm' />
          </div>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Ngày kết thúc</label>
            <input type='date' name='date_end' className='border-input w-full rounded-md border px-3 py-2 text-sm' />
          </div>
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Địa điểm</label>
          <input name='location' className='border-input w-full rounded-md border px-3 py-2 text-sm' />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Giải thưởng</label>
          <input name='prize_info' placeholder='VD: 5.000.000đ giải nhất' className='border-input w-full rounded-md border px-3 py-2 text-sm' />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium'>URL ảnh bìa</label>
          <input name='cover_url' type='url' className='border-input w-full rounded-md border px-3 py-2 text-sm' />
        </div>
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Trạng thái</label>
          <select name='status' defaultValue='upcoming' className='border-input w-full rounded-md border px-3 py-2 text-sm'>
            <option value='upcoming'>Sắp diễn ra</option>
            <option value='ongoing'>Đang diễn ra</option>
            <option value='finished'>Đã kết thúc</option>
            <option value='cancelled'>Đã huỷ</option>
          </select>
        </div>
        <button type='submit' className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium'>
          Tạo giải đấu
        </button>
      </form>
    </div>
  )
}
