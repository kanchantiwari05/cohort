import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Search, X } from 'lucide-react'

/**
 * Select — premium custom dropdown, replaces every native <select> in the app.
 *
 * Props
 * ─────
 *  value       current value string/number
 *  onChange    fn(newValue)
 *  options     [{ value, label, icon?, color? }]
 *  placeholder text shown when nothing selected
 *  label       optional field label rendered above the trigger
 *  size        'sm' (h-8, xs text) | 'md' (h-[38px], sm text — default)
 *  searchable  render a search box inside the dropdown
 *  clearable   render an × that calls onChange('')
 *  disabled
 *  error       error string rendered below
 *  className   wrapper classes
 */
export default function Select({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select…',
  label,
  size = 'md',
  searchable = false,
  clearable = false,
  disabled = false,
  error,
  className = '',
}) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef   = useRef(null)
  const searchRef = useRef(null)
  const id = useId()

  const selected = options.find(o => String(o.value) === String(value))

  // close on outside click
  useEffect(() => {
    function handle(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // focus search on open
  useEffect(() => {
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 30)
    if (!open) setQuery('')
  }, [open, searchable])

  // Escape to close
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  const visible = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const pick = (opt) => { onChange(opt.value); setOpen(false); setQuery('') }

  const H  = size === 'sm' ? 'h-8'     : 'h-[38px]'
  const TX = size === 'sm' ? 'text-xs' : 'text-sm'
  const PX = size === 'sm' ? 'px-2.5'  : 'px-3'
  const IC = size === 'sm' ? 12 : 14

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        className={[
          'w-full flex items-center justify-between gap-2 rounded-button border bg-white',
          'transition-all duration-150 outline-none select-none',
          H, TX, PX,
          error
            ? 'border-danger'
            : open
              ? 'border-teal shadow-[0_0_0_3px_rgba(2,128,144,0.12)]'
              : 'border-border hover:border-teal/50',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className={`flex items-center gap-2 truncate min-w-0 flex-1 ${selected ? 'text-primary' : 'text-secondary'}`}>
          {selected?.icon && <selected.icon size={IC} className="flex-shrink-0 text-secondary" />}
          {selected?.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: selected.color }} />}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {clearable && selected && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onChange('') }}
              className="p-0.5 rounded text-secondary hover:text-primary hover:bg-surface transition-colors"
            >
              <X size={11} />
            </span>
          )}
          <ChevronDown size={IC} className={`text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-[60] bg-white rounded-card border border-border shadow-modal overflow-hidden"
            style={{ minWidth: '100%', maxHeight: 280 }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1  }}
            exit={  { opacity: 0, y: -4,  scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            {searchable && (
              <div className="p-2 border-b border-border">
                <div className="flex items-center gap-2 px-2 h-8 rounded-button bg-surface border border-border focus-within:border-teal transition-colors">
                  <Search size={12} className="text-secondary flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text" value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="flex-1 text-xs bg-transparent outline-none text-primary placeholder:text-secondary"
                  />
                </div>
              </div>
            )}

            <div className="overflow-y-auto" style={{ maxHeight: searchable ? 224 : 268 }}>
              {visible.length === 0 ? (
                <p className="px-3 py-5 text-xs text-secondary text-center">No results</p>
              ) : visible.map(opt => {
                const active = String(opt.value) === String(value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => pick(opt)}
                    className={[
                      'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                      active ? 'bg-teal/10 text-teal font-medium' : 'text-primary hover:bg-surface',
                    ].join(' ')}
                  >
                    {opt.icon  && <opt.icon size={14} className={`flex-shrink-0 ${active ? 'text-teal' : 'text-secondary'}`} />}
                    {opt.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />}
                    <span className="truncate flex-1">{opt.label}</span>
                    {active && <Check size={13} className="text-teal flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-danger mt-1.5 flex items-center gap-1"><span>⚠</span> {error}</p>
      )}
    </div>
  )
}
