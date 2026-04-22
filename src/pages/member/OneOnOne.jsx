import { Construction } from 'lucide-react'

export default function OneOnOnePage() {
  return (
    <div className="p-3 space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-primary">OneOnOne</h1>
        <p className="text-secondary text-sm mt-1">Schedule 1-on-1 meetings</p>
      </div>
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-amber/10 rounded-card flex items-center justify-center mb-4">
          <Construction size={24} className="text-amber" />
        </div>
        <h2 className="text-base font-semibold text-primary">OneOnOne — Coming in Phase 2</h2>
        <p className="text-secondary text-sm mt-2 max-w-xs">Schedule 1-on-1 meetings. This module will be fully built in the next phase.</p>
      </div>
    </div>
  )
}
