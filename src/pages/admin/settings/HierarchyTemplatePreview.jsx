/**
 * Visual previews for default hierarchy presets (community types, etc.)
 */

export function HierarchyTreeCanvas({ levels, className = '', compact = false }) {
  const list = levels || []
  if (!list.length) {
    return <span className="text-[11px] text-[#90A4AE] italic">No levels</span>
  }

  const pad = compact ? 'px-2 py-1 text-[9px]' : 'px-2.5 py-1.5 text-[10px]'
  const lineH = compact ? 'h-2' : 'h-3'

  return (
    <div
      className={`flex flex-col items-center ${compact ? 'min-w-[88px]' : 'min-w-[120px]'} ${className}`}
      role="img"
      aria-label={`Hierarchy tree: ${list.map(l => l.name).join(' to ')}`}
    >
      {list.map((lv, i) => (
        <div key={`${lv.index}-${i}`} className="flex flex-col items-center w-full">
          <div
            className={`rounded-lg font-semibold text-white shadow-sm border border-white/25 max-w-[160px] w-full text-center truncate ${pad}`}
            style={{ background: lv.color || '#546E7A' }}
            title={lv.name}
          >
            {lv.name}
          </div>
          {i < list.length - 1 && (
            <div className={`w-0.5 ${lineH} bg-[#90A4AE] flex-shrink-0 rounded-full`} aria-hidden />
          )}
        </div>
      ))}
    </div>
  )
}

export function HierarchyNodesList({ levels, className = '', compact = false }) {
  const list = levels || []
  if (!list.length) {
    return <span className="text-[11px] text-[#90A4AE] italic">—</span>
  }

  return (
    <ol className={`space-y-1 ${compact ? 'text-[9px]' : 'text-[10px]'} ${className}`}>
      {list.map((lv, i) => (
        <li key={`${lv.index}-${i}`} className="flex items-center gap-2 text-left">
          <span className="text-[#90A4AE] tabular-nums w-7 flex-shrink-0">L{lv.index}</span>
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-white"
            style={{ background: lv.color || '#546E7A' }}
            aria-hidden
          />
          <span className="text-[#1A237E] font-medium truncate" title={lv.name}>
            {lv.name}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** Side-by-side tree + nodes for drawer / wide panels */
export function HierarchyTemplateDualView({ levels, title = 'Hierarchy template' }) {
  const list = levels || []
  return (
    <div className="rounded-[12px] border border-[#D0DCF0] bg-[#FAFCFF] overflow-hidden">
      <div className="px-3 py-2 border-b border-[#D0DCF0] bg-[#F4F8FF]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">{title}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#D0DCF0]">
        <div className="p-4">
          <p className="text-[10px] font-semibold text-[#028090] uppercase mb-2">Canvas tree</p>
          <div className="flex justify-center rounded-lg bg-white border border-[#E3F2FD] p-3 min-h-[100px] items-start">
            <HierarchyTreeCanvas levels={list} />
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-semibold text-[#028090] uppercase mb-2">Nodes</p>
          <div className="rounded-lg bg-white border border-[#E3F2FD] p-3 min-h-[100px]">
            <HierarchyNodesList levels={list} />
          </div>
        </div>
      </div>
    </div>
  )
}
