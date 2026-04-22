export function SkeletonLine({ w = 'w-full', h = 'h-4' }) {
  return <div className={`${w} ${h} bg-gray-100 rounded animate-pulse`} />
}

export function SkeletonRow({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="td px-4 py-3.5">
          <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
      <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}
