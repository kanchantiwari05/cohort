import { useState } from 'react'
import { ChevronRight, LogOut, User, Briefcase, Users, Bell, Shield } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MEMBER = {
  name: 'Amit Desai',
  business: 'Desai Technologies',
  category: 'IT Services',
  chapter: 'Andheri Chapter',
  memberId: 'lm001',
  joinDate: 'March 2024',
  phone: '+91 98765 43210',
  email: 'amit@desaitech.com',
  website: 'www.desaitech.com',
  bio: 'IT solutions provider specialising in enterprise software, cloud infrastructure, and digital transformation.',
}

function initials(name) { return name.split(' ').map(n => n[0]).join('').slice(0, 2) }

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border">
      <Icon size={14} className="text-secondary" />
      <p className="text-xs font-semibold text-secondary uppercase tracking-wide">{title}</p>
    </div>
  )
}

function FieldRow({ label, value, last }) {
  return (
    <div className={`flex gap-3 px-4 py-3.5 bg-white ${last ? '' : 'border-b border-border'}`}>
      <span className="text-sm text-secondary w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-primary font-medium flex-1">{value}</span>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: value ? '#028090' : '#CBD5E1' }}
    >
      <span
        className="block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ml-0.5"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function ToggleRow({ label, sub, value, onChange, last }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3.5 bg-white ${last ? '' : 'border-b border-border'}`}>
      <div className="flex-1">
        <p className="text-sm text-primary">{label}</p>
        {sub && <p className="text-xs text-secondary mt-0.5">{sub}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

export default function MemberProfile() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const [notifs, setNotifs] = useState({
    newReferral:   true,
    referralUpdate: true,
    meetingReminder: true,
    chapterAnnouncement: true,
    weeklyDigest:   false,
  })

  const setNotif = (key) => (val) => setNotifs(prev => ({ ...prev, [key]: val }))

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out', { style: { fontSize: 13 } })
  }

  return (
    <div className="p-3">
      {/* Navy profile header */}
      <div className="px-4 pt-12 pb-6 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #0D2444 100%)' }}>
        <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-white">{initials(MEMBER.name)}</span>
        </div>
        <h1 className="text-xl font-bold text-white">{MEMBER.name}</h1>
        <p className="text-white/60 text-sm mt-0.5">{MEMBER.business}</p>
        <div className="flex gap-2 mt-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: 'rgba(2,128,144,0.5)' }}>{MEMBER.category}</span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: 'rgba(255,255,255,0.1)' }}>{MEMBER.chapter}</span>
        </div>
      </div>

      {/* Community info strip */}
      <div className="grid grid-cols-3 border-b border-border bg-white">
        {[
          { label: 'Member ID', value: MEMBER.memberId },
          { label: 'Joined',    value: MEMBER.joinDate },
          { label: 'Score',     value: '87'            },
        ].map(s => (
          <div key={s.label} className="py-3 text-center border-r border-border last:border-r-0">
            <p className="text-sm font-bold text-primary">{s.value}</p>
            <p className="text-[10px] text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="pb-8 space-y-px">
        {/* Personal info */}
        <div className="mt-4">
          <SectionHeader icon={User} title="Personal Info" />
          <FieldRow label="Full Name" value={MEMBER.name} />
          <FieldRow label="Phone"     value={MEMBER.phone} />
          <FieldRow label="Email"     value={MEMBER.email} last />
        </div>

        {/* Business info */}
        <div className="mt-4">
          <SectionHeader icon={Briefcase} title="Business Info" />
          <FieldRow label="Business"  value={MEMBER.business} />
          <FieldRow label="Category"  value={MEMBER.category} />
          <FieldRow label="Website"   value={MEMBER.website} />
          <div className="bg-white px-4 py-3.5">
            <p className="text-sm text-secondary mb-1">About</p>
            <p className="text-sm text-primary">{MEMBER.bio}</p>
          </div>
        </div>

        {/* Community info */}
        <div className="mt-4">
          <SectionHeader icon={Users} title="Community Info" />
          <FieldRow label="Chapter"   value={MEMBER.chapter} />
          <FieldRow label="Zone"      value="North Zone" />
          <FieldRow label="Role"      value="Member" last />
        </div>

        {/* Notification settings */}
        <div className="mt-4">
          <SectionHeader icon={Bell} title="Notification Settings" />
          <ToggleRow label="New Referral" sub="When someone gives you a referral" value={notifs.newReferral} onChange={setNotif('newReferral')} />
          <ToggleRow label="Referral Updates" sub="Status changes on your referrals" value={notifs.referralUpdate} onChange={setNotif('referralUpdate')} />
          <ToggleRow label="Meeting Reminders" sub="24 hours before each meeting" value={notifs.meetingReminder} onChange={setNotif('meetingReminder')} />
          <ToggleRow label="Chapter Announcements" value={notifs.chapterAnnouncement} onChange={setNotif('chapterAnnouncement')} />
          <ToggleRow label="Weekly Digest" sub="Summary every Monday morning" value={notifs.weeklyDigest} onChange={setNotif('weeklyDigest')} last />
        </div>

        {/* Account */}
        <div className="mt-4">
          <SectionHeader icon={Shield} title="Account" />
          <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white border-b border-border hover:bg-surface transition-colors">
            <span className="text-sm text-primary">Change Password</span>
            <ChevronRight size={15} className="text-secondary" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white border-b border-border hover:bg-surface transition-colors">
            <span className="text-sm text-primary">Privacy Settings</span>
            <ChevronRight size={15} className="text-secondary" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-surface transition-colors">
            <span className="text-sm text-secondary">App Version 1.0.0</span>
          </button>
        </div>

        {/* Logout */}
        <div className="mt-4 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] border-2 border-danger text-danger font-semibold text-sm hover:bg-danger/5 transition-colors active:scale-95"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
