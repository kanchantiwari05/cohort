import { Construction } from 'lucide-react'

export default function ComingSoon({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="w-16 h-16 bg-accent/10 rounded-card flex items-center justify-center mb-4">
        <Construction size={28} className="text-accent" />
      </div>
      <h2 className="text-[22px] font-semibold text-textPrimary">{title}</h2>
      <p className="text-textSecondary text-sm mt-2 max-w-xs">
        {description || 'This page is under construction. Check back soon.'}
      </p>
    </div>
  )
}
