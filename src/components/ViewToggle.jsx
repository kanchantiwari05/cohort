import { LayoutGrid, List } from 'lucide-react'

/**
 * Icon-only pill toggle: grid-style layout vs row/list layout.
 * @param {string} value — must equal firstValue or secondValue
 * @param {(v: string) => void} onChange
 * @param {string} [firstValue='card'] — left segment (e.g. 'kanban', 'org')
 * @param {string} [secondValue='table'] — right segment (e.g. 'table', 'list')
 */
export default function ViewToggle({
  value,
  onChange,
  firstValue = 'card',
  secondValue = 'table',
  className = '',
}) {
  const leftSelected = value === firstValue
  return (
    <div
      className={`inline-flex h-9 items-stretch rounded-full border border-border overflow-hidden divide-x divide-border/80 flex-shrink-0 bg-white shadow-card ${className}`}
      role="group"
      aria-label="Result layout"
    >
      <button
        type="button"
        onClick={() => onChange(firstValue)}
        aria-pressed={leftSelected}
        aria-label="Show as tiles"
        className={`flex items-center justify-center px-3.5 min-w-[2.75rem] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal
          ${leftSelected ? 'bg-navy text-white' : 'bg-white text-secondary hover:bg-surface'}`}
      >
        <LayoutGrid size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => onChange(secondValue)}
        aria-pressed={!leftSelected}
        aria-label="Show as list"
        className={`flex items-center justify-center px-3.5 min-w-[2.75rem] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal
          ${!leftSelected ? 'bg-navy text-white' : 'bg-white text-secondary hover:bg-surface'}`}
      >
        <List size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
