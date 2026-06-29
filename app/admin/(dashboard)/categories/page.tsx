import { Button } from '@/components/ui/button'
import { getCategories } from '@/lib/queries/catalog'
import { createCategory, deleteCategory } from './actions'

const inputCls = 'border-border w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-500'

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Danh mục ({categories.length})</h1>

      <form action={createCategory} className='border-border grid max-w-2xl grid-cols-3 gap-3 rounded-lg border p-4'>
        <input name='name' placeholder='Tên *' required className={inputCls} />
        <input name='slug' placeholder='Slug *' required className={inputCls} />
        <input name='sort_order' type='number' placeholder='Thứ tự' className={inputCls} />
        <div>
          <Button type='submit'>+ Thêm</Button>
        </div>
      </form>

      <div className='border-border overflow-hidden rounded-lg border'>
        <table className='w-full text-sm'>
          <thead className='bg-secondary/50 text-left'>
            <tr>
              <th className='p-3'>Tên</th>
              <th className='p-3'>Slug</th>
              <th className='p-3 text-right'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className='border-border border-t'>
                <td className='p-3 font-medium'>{c.name}</td>
                <td className='text-secondary-foreground p-3'>{c.slug}</td>
                <td className='p-3'>
                  <form action={deleteCategory.bind(null, c.id)} className='text-right'>
                    <button type='submit' className='text-red-500 underline'>
                      Xoá
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
