import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, SlidersHorizontal, X, Search } from 'lucide-react'

/**
 * FilterBar — modern multi-select pill filter system.
 *
 * Props
 * ─────
 * filters  [{ key, label, value, onChange, options, multi?, icon? }]
 *   single: value = string  · onChange(string) · options[0] = "show all" sentinel
 *   multi:  value = string[]· onChange(string[])· no "show all" option needed
 * className  extra classes on the wrapper
 */

const SEARCH_THRESHOLD = 6

function FilterPill({ label, value, onChange, options, open, onOpen, onClose, multi = false }) {
  const ref       = useRef(null)
  const searchRef = useRef(null)
  const [query, setQuery] = useState('')

  // ── active state ──────────────────────────────────────────────────────────
  const isActive = multi
    ? Array.isArray(value) && value.length > 0
    : String(value) !== String(options[0]?.value ?? '')

  // ── display text when active ──────────────────────────────────────────────
  const getLabel = () => {
    if (!isActive) return null
    if (multi) {
      const sel = options.filter(o => value.includes(String(o.value)))
      if (sel.length === 1) return sel[0].label
      return `${sel[0]?.label ?? '…'} +${sel.length - 1}`
    }
    return options.find(o => String(o.value) === String(value))?.label ?? value
  }

  // ── toggle a value ────────────────────────────────────────────────────────
  const toggle = (optValue) => {
    if (multi) {
      const sv   = String(optValue)
      const curr = Array.isArray(value) ? value.map(String) : []
      onChange(curr.includes(sv) ? curr.filter(v => v !== sv) : [...curr, sv])
    } else {
      onChange(optValue)
      onClose()
    }
  }

  const clear = (e) => {
    e?.stopPropagation()
    onChange(multi ? [] : (options[0]?.value ?? ''))
    onClose()
  }

  // ── outside-click close ───────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { onClose(); setQuery('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open, onClose])

  // ── focus search on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 25)
    else      setQuery('')
  }, [open])

  const showSearch = options.length > SEARCH_THRESHOLD
  const visible    = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const selectedCount = multi && Array.isArray(value) ? value.length : 0
  const displayLabel  = getLabel()

  return (
    <div ref={ref} className="relative">
      {/* ── trigger pill ── */}
      <button
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        className={[
          'group flex items-center gap-1.5 h-[30px] rounded-full border text-[12px] font-medium select-none whitespace-nowrap outline-none transition-all duration-150',
          isActive ? 'pl-3 pr-1' : 'px-3',
          isActive
            ? 'border-[#028090]/30 bg-[#028090]/[0.07] text-[#028090]'
            : open
              ? 'border-[#028090]/40 bg-white text-[#1B3A6B] shadow-[0_0_0_3px_rgba(2,128,144,0.09)]'
              : 'border-[#D0DCF0] bg-white text-[#546E7A] hover:border-[#028090]/35 hover:text-[#1B3A6B] hover:shadow-sm',
        ].join(' ')}
      >
        {isActive ? (
          <>
            <span className="text-[#028090]/50 font-normal">{label}:</span>
            <span className="font-semibold max-w-[140px] truncate">{displayLabel}</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <ChevronDown
              size={11}
              className={`text-[#90A4AE] transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}

        {isActive && (
          <span
            role="button"
            onClick={clear}
            className="ml-0.5 flex items-center justify-center w-[20px] h-[20px] rounded-full hover:bg-[#028090]/15 transition-colors flex-shrink-0"
          >
            <X size={10} />
          </span>
        )}
      </button>

      {/* ── dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 mt-2 bg-white rounded-[10px] border border-[#D8E3F0] z-[60] overflow-hidden"
            style={{
              minWidth: 192,
              maxWidth: 288,
              boxShadow: '0 8px 28px rgba(27,58,107,0.13), 0 2px 6px rgba(27,58,107,0.07)',
            }}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={  { opacity: 0, y: -4,  scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* search */}
            {showSearch && (
              <div className="p-2 border-b border-[#F0F4FC]">
                <div className="flex items-center gap-1.5 px-2.5 h-[28px] rounded-md bg-[#F4F8FF] border border-[#E4EAF6] focus-within:border-[#028090]/40 transition-colors">
                  <Search size={11} className="text-[#90A4AE] flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="flex-1 text-[12px] bg-transparent outline-none text-[#1B3A6B] placeholder:text-[#B0BEC5]"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="text-[#B0BEC5] hover:text-[#546E7A] transition-colors">
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* options list */}
            <div className="overflow-y-auto py-1" style={{ maxHeight: 248 }}>
              {visible.length === 0 ? (
                <p className="px-3 py-5 text-[12px] text-[#90A4AE] text-center">No results</p>
              ) : visible.map(opt => {
                const active = multi
                  ? (Array.isArray(value) && value.map(String).includes(String(opt.value)))
                  : String(opt.value) === String(value)
                const isAllOpt = !multi && String(opt.value) === String(options[0]?.value)

                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(opt.value)}
                    className={[
                      'w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] text-left transition-colors',
                      active ? 'bg-[#028090]/[0.07] text-[#028090]' : 'text-[#1B3A6B] hover:bg-[#F4F8FF]',
                    ].join(' ')}
                  >
                    {/* indicator */}
                    {multi ? (
                      <span className={[
                        'w-[15px] h-[15px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors',
                        active ? 'bg-[#028090] border-[#028090]' : 'border-[#C5D3E8] bg-white',
                      ].join(' ')}>
                        {active && <Check size={9} className="text-white" strokeWidth={3} />}
                      </span>
                    ) : (
                      <span className={[
                        'w-[15px] h-[15px] rounded-full border flex items-center justify-center flex-shrink-0 transition-colors',
                        active ? 'border-[#028090]' : 'border-[#C5D3E8]',
                      ].join(' ')}>
                        {active && <span className="w-[7px] h-[7px] rounded-full bg-[#028090]" />}
                      </span>
                    )}

                    {opt.icon && (
                      <opt.icon
                        size={13}
                        className={`flex-shrink-0 ${active ? 'text-[#028090]' : 'text-[#90A4AE]'}`}
                      />
                    )}

                    <span className={`flex-1 truncate ${isAllOpt ? 'text-[#546E7A] italic' : ''}`}>
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* multi footer: count + clear */}
            {multi && selectedCount > 0 && (
              <div className="border-t border-[#F0F4FC] px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] text-[#90A4AE]">
                  {selectedCount} selected
                </span>
                <button
                  onClick={clear}
                  className="text-[11px] text-[#028090] hover:underline font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── FilterBar ──────────────────────────────────────────────────────────────
export default function FilterBar({ filters = [], className = '' }) {
  const [openKey, setOpenKey] = useState(null)

  const activeCount = filters.filter(f => {
    if (f.multi) return Array.isArray(f.value) && f.value.length > 0
    return String(f.value) !== String(f.options[0]?.value ?? '')
  }).length

  const clearAll = useCallback(() => {
    filters.forEach(f => f.onChange(f.multi ? [] : (f.options[0]?.value ?? '')))
    setOpenKey(null)
  }, [filters])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setOpenKey(null) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className="flex items-center gap-1.5 text-[11.5px] text-[#90A4AE] font-medium tracking-wide uppercase select-none">
        <SlidersHorizontal size={11} strokeWidth={2.2} />
        Filter
      </span>

      <div className="w-px h-4 bg-[#D8E3F0] flex-shrink-0 mx-0.5" />

      {filters.map(f => (
        <FilterPill
          key={f.key}
          label={f.label}
          value={f.value}
          onChange={f.onChange}
          options={f.options}
          open={openKey === f.key}
          onOpen={() => setOpenKey(f.key)}
          onClose={() => setOpenKey(null)}
          multi={f.multi ?? false}
        />
      ))}

      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={  { opacity: 0, x: -10 }}
            transition={{ duration: 0.16 }}
          >
            <div className="w-px h-4 bg-[#D8E3F0] flex-shrink-0 mx-0.5" />
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-[11.5px] text-[#546E7A] hover:text-[#C62828] transition-colors h-[28px] px-2 rounded-full hover:bg-[#FFEBEE] border border-transparent hover:border-[#FFCDD2]"
            >
              <X size={10} strokeWidth={2.5} />
              Clear {activeCount > 1 ? `${activeCount} filters` : 'filter'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
