import { Zap } from 'lucide-react'

export default function CSAAutomationPage() {
  return (
    <div className="p-3 space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-primary">Automation</h1>
        <p className="text-secondary text-sm mt-1">Engagement nudges, reminders, and lifecycle rules</p>
      </div>
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-success/10 rounded-card flex items-center justify-center mb-4">
          <Zap size={24} className="text-success" />
        </div>
        <h2 className="text-base font-semibold text-primary">Automation — Coming Soon</h2>
        <p className="text-secondary text-sm mt-2 max-w-xs">
          Engagement nudges, renewal reminders, and member lifecycle automation will be available here.
        </p>
      </div>
    </div>
  )
}
