import { MessageSquare } from 'lucide-react'

export default function CSACommunicationPage() {
  return (
    <div className="p-3 space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-primary">Communication</h1>
        <p className="text-secondary text-sm mt-1">Announcements, forums, and notifications</p>
      </div>
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-teal/10 rounded-card flex items-center justify-center mb-4">
          <MessageSquare size={24} className="text-teal" />
        </div>
        <h2 className="text-base font-semibold text-primary">Communication Hub — Coming Soon</h2>
        <p className="text-secondary text-sm mt-2 max-w-xs">
          Announcements, forums, WhatsApp templates, and push notifications will be available here.
        </p>
      </div>
    </div>
  )
}
