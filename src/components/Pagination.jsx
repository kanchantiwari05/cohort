import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Shared pagination component.
 * Props: page (1-based), total (item count), perPage, onChange(newPage)
 */
export default function Pagination({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const from = (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  // Build page number list with ellipsis
  const pages = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else if (page <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', totalPages)
  } else if (page >= totalPages - 3) {
    pages.push(1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
  } else {
    pages.push(1, '…', page - 1, page, page + 1, '…', totalPages)
  }

  const btn = (active, disabled, onClick, children) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[30px] h-[30px] px-1.5 flex items-center justify-center rounded-button text-xs font-medium transition-colors
        ${active
          ? 'bg-teal text-white'
          : disabled
            ? 'text-secondary/40 cursor-not-allowed'
            : 'text-secondary hover:bg-surface hover:text-primary'
        }`}
    >
      {children}
    </button>
  )

  return (
    <div className="flex items-center justify-between px-1 py-2 mt-1">
      <p className="text-xs text-secondary">
        Showing <span className="font-medium text-primary">{from}–{to}</span> of <span className="font-medium text-primary">{total}</span>
      </p>
      <div className="flex items-center gap-0.5">
        {btn(false, page === 1, () => onChange(page - 1), <ChevronLeft size={13} />)}
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="px-1 text-xs text-secondary">…</span>
            : btn(p === page, false, () => onChange(p), p)
        )}
        {btn(false, page === totalPages, () => onChange(page + 1), <ChevronRight size={13} />)}
      </div>
    </div>
  )
}
