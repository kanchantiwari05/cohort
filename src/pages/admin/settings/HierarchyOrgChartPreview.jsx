/**
 * Read-only org chart preview for hierarchy templates (Community Types, etc.)
 * — same visual model as admin Hierarchy Builder: canvas tree + list outline.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, CheckCircle, Maximize2, Minus, Plus, Users,
} from 'lucide-react'
import ViewToggle from '../../../components/ViewToggle'

const FALLBACK_COLORS = ['#028090', '#1B3A6B', '#E6A817', '#2E7D32', '#7C3AED']

function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => n.parentId === parentId)
    .map(n => ({ ...n, children: buildTree(nodes, n.id) }))
}

/** Build demo levels + nodes from community-type level rows (name, color, index). */
export function buildDemoLevelsAndNodes(levelsInput) {
  const raw = levelsInput || []
  const levels = raw.map((lv, i) => ({
    id: `ctp-l${i}`,
    name: lv.name?.trim() || `Level ${i + 1}`,
    color: lv.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }))
  if (!levels.length) return { levels: [], nodes: [] }

  const nodes = []
  let seq = 0
  const nid = () => `ctp-dn${++seq}`
  const sampleLas = ['A. Sharma', 'B. Menon']

  let prevIds = []
  for (let depth = 0; depth < levels.length; depth++) {
    const levelId = levels[depth].id
    const label = levels[depth].name
    const nextLayer = []
    if (depth === 0) {
      for (let i = 0; i < 2; i++) {
        const id = nid()
        nodes.push({
          id,
          name: `${label} ${i + 1}`,
          levelId,
          parentId: null,
          laName: i === 0 ? sampleLas[0] : null,
          memberCount: 48 + i * 12,
        })
        nextLayer.push(id)
      }
    } else {
      const perParent = depth === levels.length - 1 ? 1 : 2
      prevIds.forEach((pid, pi) => {
        for (let j = 0; j < perParent; j++) {
          const id = nid()
          const name = perParent > 1 ? `${label} ${pi + 1}·${j + 1}` : `${label} ${pi + 1}`
          nodes.push({
            id,
            name,
            levelId,
            parentId: pid,
            laName: depth === levels.length - 1 && pi === 0 && j === 0 ? sampleLas[1] : null,
            memberCount: 12 + j * 4 + pi * 2,
          })
          nextLayer.push(id)
        }
      })
    }
    prevIds = nextLayer
  }

  return { levels, nodes }
}

function makeLayoutEngine(sz) {
  const { W: NODE_W, H: NODE_H, H_GAP, V_GAP } = sz

  function computeSubtreeLayout(node) {
    if (!node.children?.length) {
      return { width: NODE_W, nodeX: 0 }
    }
    let cursor = 0
    const childOffsets = []
    node.children.forEach((child, i) => {
      const cl = computeSubtreeLayout(child)
      childOffsets.push({ offset: cursor, width: cl.width })
      cursor += cl.width + (i < node.children.length - 1 ? H_GAP : 0)
    })
    const totalChildWidth = cursor
    const totalWidth = Math.max(totalChildWidth, NODE_W)
    const nodeX = (totalChildWidth - NODE_W) / 2
    return { width: totalWidth, nodeX, childOffsets }
  }

  function assignPositions(node, baseX, baseY, layoutCache, positions = [], edges = []) {
    const layout = layoutCache.get(node.id) || computeSubtreeLayout(node)
    layoutCache.set(node.id, layout)
    const nodeAbsX = baseX + layout.nodeX
    const cx = nodeAbsX + NODE_W / 2
    const cy = baseY + NODE_H
    positions.push({ id: node.id, x: nodeAbsX, y: baseY, cx, cy })

    if (node.children?.length && layout.childOffsets) {
      node.children.forEach((child, i) => {
        const childLayout = computeSubtreeLayout(child)
        layoutCache.set(child.id, childLayout)
        const childOffsetX = baseX + layout.childOffsets[i].offset
        const childAbsX = childOffsetX + childLayout.nodeX
        const childCX = childAbsX + NODE_W / 2
        const childY = baseY + NODE_H + V_GAP
        edges.push({ px: cx, py: cy, cx: childCX, cy: childY })
        assignPositions(child, childOffsetX, childY, layoutCache, positions, edges)
      })
    }
    return { positions, edges }
  }

  return { computeSubtreeLayout, assignPositions, NODE_W, NODE_H, H_GAP }
}

function ReadonlyOrgCard({ node, level, sz }) {
  const { NODE_W, NODE_H } = sz
  const isUnassigned = !node.laName
  return (
    <div
      className="absolute bg-white rounded-card shadow-sm border border-border pointer-events-none"
      style={{ width: NODE_W, height: NODE_H, top: node.y, left: node.x }}
    >
      <div className="h-1.5 rounded-t-card" style={{ background: level?.color ?? '#546E7A' }} />
      <div className="px-2.5 py-1.5 flex flex-col justify-between h-[calc(100%-6px)]">
        <div>
          <div className="flex items-start justify-between gap-1">
            <p className="text-[11px] font-semibold text-primary leading-tight truncate flex-1">{node.name}</p>
            {isUnassigned ? (
              <AlertTriangle size={10} className="text-amber flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle size={10} className="text-success flex-shrink-0 mt-0.5" />
            )}
          </div>
          {level && (
            <span
              className="text-[8px] font-medium px-1 py-0.5 rounded-full mt-0.5 inline-block"
              style={{ background: level.color + '18', color: level.color }}
            >
              {level.name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="flex items-center gap-0.5 text-[9px] text-secondary">
            <Users size={8} /> {node.memberCount}
          </span>
          {!isUnassigned && (
            <span className="text-[9px] text-secondary truncate max-w-[64px]" title={node.laName}>
              {node.laName?.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function ReadonlyOrgCanvas({ nodes, levels, sz }) {
  const { computeSubtreeLayout, assignPositions, NODE_W, NODE_H, H_GAP } = makeLayoutEngine(sz)
  const tree = buildTree(nodes)
  if (!tree.length) return null

  const layoutCache = new Map()
  let allPositions = []
  let allEdges = []
  let rootCursor = 0

  tree.forEach(root => {
    const cl = computeSubtreeLayout(root)
    layoutCache.set(root.id, cl)
    const { positions, edges } = assignPositions(root, rootCursor, 0, layoutCache)
    allPositions.push(...positions)
    allEdges.push(...edges)
    rootCursor += cl.width + H_GAP * 3
  })
  rootCursor -= H_GAP * 3

  const totalW = rootCursor
  const maxY = Math.max(...allPositions.map(p => p.y)) + NODE_H
  const PAD = compactPad(sz)

  return (
    <div className="relative" style={{ width: totalW + PAD * 2, height: maxY + PAD * 2, minWidth: '100%' }}>
      <svg
        className="absolute inset-0 pointer-events-none"
        width={totalW + PAD * 2}
        height={maxY + PAD * 2}
        style={{ overflow: 'visible' }}
      >
        {allEdges.map((e, i) => {
          const midY = (e.py + e.cy) / 2
          const d = `M ${e.px + PAD} ${e.py + PAD}
                     C ${e.px + PAD} ${midY + PAD},
                       ${e.cx + PAD} ${midY + PAD},
                       ${e.cx + PAD} ${e.cy + PAD}`
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#D0DCF0"
              strokeWidth={1.25}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      {allPositions.map(pos => {
        const node = nodes.find(n => n.id === pos.id)
        if (!node) return null
        const level = levels.find(l => l.id === node.levelId)
        return (
          <ReadonlyOrgCard
            key={node.id}
            node={{ ...node, x: pos.x + PAD, y: pos.y + PAD }}
            level={level}
            sz={sz}
          />
        )
      })}
    </div>
  )
}

function compactPad(sz) {
  return sz.W <= 120 ? 24 : 40
}

function ZoomableCanvas({ children }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 36, y: 28 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function onWheel(e) {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 0.91
      setZoom(z => {
        const newZ = Math.min(2.4, Math.max(0.2, z * factor))
        setPan(p => ({
          x: mouseX - (mouseX - p.x) * (newZ / z),
          y: mouseY - (mouseY - p.y) * (newZ / z),
        }))
        return newZ
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  function onMouseDown(e) {
    if (e.button !== 0) return
    setIsDragging(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
  }
  function onMouseMove(e) {
    if (!isDragging || !dragRef.current) return
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    })
  }
  function onMouseUp() {
    setIsDragging(false)
    dragRef.current = null
  }

  function zoomStep(delta) {
    setZoom(z => Math.min(2.4, Math.max(0.2, z + delta)))
  }
  function resetView() {
    setZoom(1)
    setPan({ x: 36, y: 28 })
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none rounded-lg border border-[#E3F2FD] bg-white ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
      <div
        className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-white border border-[#D0DCF0] rounded-button shadow-sm px-1 py-1"
        onMouseDown={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => zoomStep(-0.12)}
          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-[#F4F8FF] rounded-button"
        >
          <Minus size={12} />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="text-[11px] text-secondary hover:text-primary w-10 text-center h-7 rounded-button hover:bg-[#F4F8FF] font-medium"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => zoomStep(0.12)}
          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-[#F4F8FF] rounded-button"
        >
          <Plus size={12} />
        </button>
        <div className="w-px h-4 bg-[#D0DCF0] mx-0.5" />
        <button
          type="button"
          onClick={resetView}
          className="w-7 h-7 flex items-center justify-center text-secondary hover:text-primary hover:bg-[#F4F8FF] rounded-button"
        >
          <Maximize2 size={11} />
        </button>
      </div>
    </div>
  )
}

function ReadonlyOutlineList({ nodes, levels }) {
  const tree = buildTree(nodes)

  function Row({ node, depth }) {
    const level = levels.find(l => l.id === node.levelId)
    return (
      <div>
        <div
          className="flex items-center gap-2 text-[11px] py-1 rounded-button"
          style={{ paddingLeft: depth * 14 + 4 }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0 ring-1 ring-white" style={{ background: level?.color }} />
          <span className="font-medium text-[#1A237E] truncate flex-1">{node.name}</span>
          <span className="text-[#90A4AE] tabular-nums flex-shrink-0">{node.memberCount}</span>
        </div>
        {node.children?.map(ch => (
          <Row key={ch.id} node={ch} depth={depth + 1} />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full p-3 text-left">
      {tree.map(r => (
        <Row key={r.id} node={r} depth={0} />
      ))}
    </div>
  )
}

const SIZE_NORMAL = { W: 152, H: 80, H_GAP: 20, V_GAP: 48 }
const SIZE_COMPACT = { W: 118, H: 62, H_GAP: 14, V_GAP: 36 }

/**
 * @param {Array<{ name: string, color?: string, index?: number }>} levels — template levels
 * @param {boolean} [compact] — smaller cards for table cells
 * @param {string} [title]
 */
export default function HierarchyOrgChartPreview({ levels, compact = false, title = 'Template preview' }) {
  const [treeViewMode, setTreeViewMode] = useState('org')
  const sz = compact ? SIZE_COMPACT : SIZE_NORMAL

  const { levels: L, nodes } = useMemo(() => buildDemoLevelsAndNodes(levels), [levels])

  const key = useMemo(
    () => (levels || []).map(l => `${l.name}:${l.color}`).join('|'),
    [levels]
  )

  if (!L.length) {
    return (
      <div className="rounded-[12px] border border-[#D0DCF0] bg-[#FAFCFF] p-6 text-center text-[13px] text-[#90A4AE]">
        Add at least one hierarchy level to see the preview.
      </div>
    )
  }

  const canvasMinClass = compact ? 'min-h-[160px]' : 'min-h-[320px]'
  const listMinClass = compact ? 'min-h-[120px] max-h-[200px]' : 'min-h-[280px]'

  return (
    <div className="rounded-[12px] border border-[#D0DCF0] bg-[#FAFCFF] overflow-hidden flex flex-col" key={key}>
      <div className="px-3 py-2 border-b border-[#D0DCF0] bg-[#F4F8FF] flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#546E7A]">{title}</p>
          {!compact && (
            <p className="text-[10px] text-[#90A4AE] mt-0.5 hidden sm:block">
              Sample structure — same layout as Hierarchy Builder when a preset is applied
            </p>
          )}
        </div>
        <ViewToggle value={treeViewMode} onChange={setTreeViewMode} firstValue="org" secondValue="list" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-stretch divide-y sm:divide-y-0 sm:divide-x divide-[#D0DCF0] flex-1 min-h-0">
        <div className={`flex-1 min-w-0 p-2 sm:p-3 ${canvasMinClass}`}>
          {treeViewMode === 'org' ? (
            <ZoomableCanvas>
              <ReadonlyOrgCanvas nodes={nodes} levels={L} sz={sz} />
            </ZoomableCanvas>
          ) : (
            <div className={`h-full rounded-lg border border-[#E3F2FD] bg-white ${listMinClass}`}>
              <ReadonlyOutlineList nodes={nodes} levels={L} />
            </div>
          )}
        </div>
        {!compact && (
          <div className="flex-shrink-0 sm:w-[200px] p-3 bg-white/80">
            <p className="text-[10px] font-semibold text-[#028090] uppercase mb-2">Levels</p>
            <div className="flex flex-wrap gap-1.5">
              {L.map(l => (
                <span
                  key={l.id}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
                  style={{
                    background: l.color + '15',
                    color: l.color,
                    borderColor: l.color + '40',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
                  {l.name}
                </span>
              ))}
            </div>
            <p className="text-[9px] text-[#90A4AE] mt-3 leading-snug">
              Drag the canvas to pan · scroll or buttons to zoom (like Hierarchy Builder).
            </p>
          </div>
        )}
      </div>
      {compact && (
        <div className="px-2 py-1.5 border-t border-[#D0DCF0] bg-[#F4F8FF] flex flex-wrap gap-1">
          {L.map(l => (
            <span
              key={l.id}
              className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
              style={{
                background: l.color + '12',
                color: l.color,
                borderColor: l.color + '35',
              }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: l.color }} />
              {l.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
