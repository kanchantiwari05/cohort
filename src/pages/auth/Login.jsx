import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore, { demoAccounts } from '../../store/authStore'

const roleRedirect = {
  platform_admin: '/pa/overview',
  super_admin:    '/csa/dashboard',
  level_admin:    '/la/dashboard',
  member:         '/member/dashboard',
}

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuthStore()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400)) // simulate network
    const result = login(email, password)
    setLoading(false)
    if (result.success) {
      const role = useAuthStore.getState().user.role
      toast.success('Welcome back!')
      navigate(roleRedirect[role] || '/login')
    } else {
      toast.error(result.error)
    }
  }

  const quickLogin = (accountEmail) => {
    const acc = demoAccounts[accountEmail]
    login(accountEmail, acc.password)
    const role = acc.role
    navigate(roleRedirect[role] || '/login')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-card flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-[28px] font-bold text-textPrimary">CNP</h1>
          <p className="text-textSecondary text-sm mt-1">Community Networking Platform</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-[22px] font-semibold text-textPrimary mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-textSecondary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 h-11"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo quick-access */}
        <div className="mt-4">
          <p className="text-xs text-textSecondary text-center mb-2">Quick demo access</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { email: 'pa@cnp.dev',     label: 'Platform Admin' },
              { email: 'csa@cnp.dev',    label: 'Super Admin' },
              { email: 'la@cnp.dev',     label: 'Level Admin' },
              { email: 'member@cnp.dev', label: 'Member' },
            ].map(({ email: e, label }) => (
              <button
                key={e}
                onClick={() => quickLogin(e)}
                className="text-xs border border-border rounded-button px-3 py-2 text-textSecondary hover:border-action hover:text-action transition-colors bg-white"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
