import { useState, useMemo } from 'react'
import { Search, Phone, X } from 'lucide-react'

const MEMBERS = [
  { id: 'm001', name: 'Amit Desai',     business: 'Desai Technologies',   category: 'IT Services',    phone: '+91 98765 43210', score: 87, chapter: 'My Chapter' },
  { id: 'm002', name: 'Priyanka Shah',  business: 'Shah Jewellers',       category: 'Retail',         phone: '+91 87654 32109', score: 72, chapter: 'My Chapter' },
  { id: 'm003', name: 'Ravi Krishnan',  business: 'Krishnan Consultants', category: 'Consulting',     phone: '+91 77654 32100', score: 65, chapter: 'My Chapter' },
  { id: 'm004', name: 'Sunita Patel',   business: 'Patel Healthcare',     category: 'Healthcare',     phone: '+91 93456 78901', score: 91, chapter: 'My Chapter' },
  { id: 'm005', name: 'Manish Gupta',   business: 'Gupta Traders',        category: 'Trading',        phone: '+91 91234 56789', score: 23, chapter: 'My Chapter' },
  { id: 'm006', name: 'Deepa Nair',     business: 'Nair Legal Associates', category: 'Legal',         phone: '+91 82345 67890', score: 78, chapter: 'My Chapter' },
  { id: 'm007', name: 'Arjun Mehta',    business: 'Mehta Exports',        category: 'Trading',        phone: '+91 90123 45678', score: 84, chapter: 'My Chapter' },
  { id: 'm008', name: 'Kavita Joshi',   business: 'Joshi Catering',       category: 'Food & Bev',     phone: '+91 78901 23456', score: 15, chapter: 'My Chapter' },
  { id: 'm009', name: 'Sanjay Verma',   business: 'Verma Real Estate',    category: 'Real Estate',    phone: '+91 99887 76655', score: 69, chapter: 'My Chapter' },
  { id: 'm010', name: 'Nisha Agarwal',  business: 'Agarwal Events',       category: 'Events',         phone: '+91 88776 65544', score: 55, chapter: 'My Chapter' },
  { id: 'm011', name: 'Rahul Bhatt',    business: 'Bhatt Insurance',      category: 'Finance',        phone: '+91 77665 54433', score: 82, chapter: 'My Chapter' },
  { id: 'm012', name: 'Pooja Desai',    business: 'Desai PR Agency',      category: 'Marketing',      phone: '+91 66554 43322', score: 80, chapter: 'My Chapter' },
  { id: 'm013', name: 'Kiran Rao',      business: 'Rao Logistics',        category: 'Logistics',      phone: '+91 55443 32211', score: 74, chapter: 'Other' },
  { id: 'm014', name: 'Fatima Sheikh',  business: 'Sheikh Textiles',      category: 'Trading',        phone: '+91 44332 21100', score: 88, chapter: 'Other' },
]

const CATEGORIES = ['All', 'IT Services', 'Retail', 'Consulting', 'Healthcare', 'Legal', 'Trading', 'Finance', 'Real Estate', 'Marketing', 'Food & Bev', 'Events', 'Logistics']
const CHAPTER_FILTERS = ['All Chapters', 'My Chapter']

function initials(name) { return name.split(' ').map(n => n[0]).join('').slice(0, 2) }

function scoreColor(s) {
  if (s >= 80) return '#2E7D32'
  if (s >= 60) return '#C17900'
  return '#BF360C'
}

function MemberProfile({ member, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-white rounded-t-[24px] overflow-hidden"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-primary">Member Profile</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
            <X size={15} className="text-secondary" />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          <div className="px-5 py-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-navy">{initials(member.name)}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{member.name}</p>
                <p className="text-sm text-secondary">{member.business}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface text-secondary">{member.category}</span>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold" style={{ color: scoreColor(member.score) }}>{member.score}</div>
                <div className="text-[10px] text-secondary">Score</div>
              </div>
            </div>

            {/* Contact actions */}
            <div className="flex gap-3 mb-5">
              <a
                href={`tel:${member.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] border border-border bg-surface text-sm font-medium text-primary active:scale-95 transition-transform"
              >
                <Phone size={15} className="text-teal" /> Call
              </a>
              <a
                href={`https://wa.me/${member.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-medium text-white active:scale-95 transition-transform"
                style={{ background: '#25D366' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.555 4.103 1.523 5.83L.057 23.928c-.073.28.185.538.466.466l6.169-1.46A11.945 11.945 0 0012 24c6.626 0 12-5.373 12-12S18.626 0 12 0zm0 21.818a9.815 9.815 0 01-4.983-1.362l-.356-.212-3.674.869.882-3.573-.232-.368A9.796 9.796 0 012.182 12C2.182 6.58 6.579 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
                </svg>
                WhatsApp
              </a>
            </div>

            {/* Details */}
            <div className="space-y-2.5">
              {[
                { label: 'Phone',    value: member.phone    },
                { label: 'Category', value: member.category },
                { label: 'Chapter',  value: 'Andheri Chapter' },
              ].map(row => (
                <div key={row.label} className="flex gap-3 text-sm">
                  <span className="text-secondary w-20 flex-shrink-0">{row.label}</span>
                  <span className="text-primary font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MemberDirectory() {
  const [query, setQuery] = useState('')
  const [chapterFilter, setChapterFilter] = useState('All Chapters')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [profileMember, setProfileMember] = useState(null)

  const filtered = useMemo(() => {
    return MEMBERS.filter(m => {
      const q = query.toLowerCase()
      const matchQuery = !q || m.name.toLowerCase().includes(q) || m.business.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      const matchChapter = chapterFilter === 'All Chapters' || (chapterFilter === 'My Chapter' && m.chapter === 'My Chapter')
      const matchCat = categoryFilter === 'All' || m.category === categoryFilter
      return matchQuery && matchChapter && matchCat
    })
  }, [query, chapterFilter, categoryFilter])

  return (
    <div className="p-3">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: '#1B3A6B' }}>
        <h1 className="text-xl font-bold text-white mb-4">Member Directory</h1>
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, business, category…"
            className="w-full pl-9 pr-4 py-2.5 rounded-[12px] text-sm text-white placeholder-white/40 outline-none"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
          />
        </div>
      </div>

      {/* Chapter filter */}
      <div className="px-4 pt-3 flex gap-2">
        {CHAPTER_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setChapterFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              chapterFilter === f ? 'bg-navy text-white border-navy' : 'bg-white text-secondary border-border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="px-4 pt-2 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              categoryFilter === c ? 'bg-teal text-white border-teal' : 'bg-white text-secondary border-border'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Members list */}
      <div className="px-4 pb-6 space-y-2.5">
        <p className="text-xs text-secondary mb-1">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
        {filtered.map(m => (
          <button
            key={m.id}
            onClick={() => setProfileMember(m)}
            className="w-full flex items-center gap-3 p-3.5 rounded-[14px] bg-white border border-border text-left hover:border-teal/40 transition-colors active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-navy">{initials(m.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{m.name}</p>
              <p className="text-xs text-secondary truncate">{m.business}</p>
              <span className="text-[10px] text-secondary">{m.category}</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="text-base font-bold" style={{ color: scoreColor(m.score) }}>{m.score}</div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-teal/10 flex items-center justify-center">
                  <Phone size={12} className="text-teal" />
                </div>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search size={32} className="text-secondary mb-3" />
            <p className="text-sm text-secondary">No members found</p>
          </div>
        )}
      </div>

      {profileMember && <MemberProfile member={profileMember} onClose={() => setProfileMember(null)} />}
    </div>
  )
}
