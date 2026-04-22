import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, RotateCcw, Shield, TrendingUp, GitBranch,
  Eye, EyeOff, Smartphone, Mail, ChevronLeft,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { demoAccounts } from '../../data/users'

// ── easings ────────────────────────────────────────────────────────────────
const EO = [0.22, 1, 0.36, 1]
const EI = [0.55, 0, 1, 0.45]

// ── left-panel features ────────────────────────────────────────────────────
const features = [
  { icon: Shield,     text: 'White-label branded community app' },
  { icon: TrendingUp, text: 'Real-time referral & business tracking' },
  { icon: GitBranch,  text: 'Dynamic hierarchy — any structure' },
]

// ── role badge styles ──────────────────────────────────────────────────────
const ROLE_STYLE_LIGHT = {
  platform_admin:        { background: 'rgba(191,54,12,0.12)',  color: '#BF360C' },
  community_super_admin: { background: 'rgba(2,128,144,0.12)',  color: '#028090' },
  level_admin:           { background: 'rgba(230,168,23,0.12)', color: '#C48E0E' },
  member:                { background: 'rgba(46,125,50,0.12)',  color: '#2E7D32' },
}

// ── inner-form content transition ──────────────────────────────────────────
const formV = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.38, ease: EO } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.22, ease: EI } },
}

// ── OTP 6-box input ────────────────────────────────────────────────────────
function OTPInput({ onComplete, hasError, disabled }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const refs = useRef([])

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const ch = val.slice(-1)
    const next = [...digits]; next[i] = ch; setDigits(next)
    if (ch && i < 5) refs.current[i + 1]?.focus()
    if (next.every(d => d !== '')) onComplete(next.join(''))
  }
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) { const n = [...digits]; n[i] = ''; setDigits(n) }
      else if (i > 0) { refs.current[i - 1]?.focus(); const n = [...digits]; n[i - 1] = ''; setDigits(n) }
    } else if (e.key === 'ArrowLeft'  && i > 0) refs.current[i - 1]?.focus()
      else if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }
  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) { setDigits(text.split('')); refs.current[5]?.focus(); onComplete(text) }
    e.preventDefault()
  }
  useEffect(() => { refs.current[0]?.focus() }, [])

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <motion.input
          key={i}
          ref={el => (refs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1} value={d} disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className={`otp-box ${d ? 'filled' : ''} ${hasError ? 'error' : ''} ${disabled ? 'opacity-50' : ''}`}
          initial={{ opacity: 0, y: 12, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.36, ease: EO }}
        />
      ))}
    </div>
  )
}

// ── Countdown ──────────────────────────────────────────────────────────────
function Countdown({ seconds, onEnd }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) { onEnd(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left, onEnd])
  return (
    <span className="text-secondary text-sm">
      Resend in <span className="text-teal font-medium">{left}s</span>
    </span>
  )
}

// ── Shared left branding panel ─────────────────────────────────────────────
function LeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[60%] flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0F2347 0%, #1B3A6B 45%, #2E5299 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full border border-white/[0.08]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(2,128,144,0.12) 0%, transparent 70%)', transform: 'translate(30%,30%)' }} />
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(230,168,23,0.06) 0%, transparent 70%)' }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lgrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lgrid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-teal rounded-card flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div>
            <p className="text-white font-bold text-3xl tracking-tight leading-none">Cohort</p>
            <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">Platform</p>
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white leading-[1.15] mb-4">
          Cohort Ops<br />Control<br />
          <span className="text-teal-light italic">Center.</span>
        </h1>
        <p className="text-white/55 text-[15px] leading-relaxed max-w-sm mt-6">
          Manage tenants, communities, and platform operations from one secure admin workspace.
        </p>
      </div>

      <div className="relative z-10 space-y-4">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-button bg-teal/20 flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-teal-light" />
            </div>
            <span className="text-white/80 text-sm">{text}</span>
          </div>
        ))}
        <div className="pt-5 border-t border-white/10">
          <p className="text-white/50 text-2xs uppercase tracking-widest mb-2">Trusted by</p>
          <div className="flex flex-wrap gap-2">
            {['Nexa Chambers', 'Metro Trade Guild', 'Summit BNI Circle'].map(name => (
              <span key={name} className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                {name}
              </span>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-white/40 text-xs">All systems operational</span>
          </div>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs">v1.0 · April 2026</span>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const navigate = useNavigate()
  const { sendOTP, verifyOTP, quickLogin, loginWithEmailPassword, pendingPhone } = useAuthStore()

  // login form state
  const [loginMethod,   setLoginMethod]   = useState('otp')
  const [phone,         setPhone]         = useState('')
  const [step,          setStep]          = useState('phone')
  const [loading,       setLoading]       = useState(false)
  const [otpError,      setOtpError]      = useState(false)
  const [phoneError,    setPhoneError]    = useState('')
  const [canResend,     setCanResend]     = useState(false)
  const [resendKey,     setResendKey]     = useState(0)
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [emailError,    setEmailError]    = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [emailLoading,  setEmailLoading]  = useState(false)

  const switchMethod = (m) => {
    setLoginMethod(m)
    setPhone(''); setStep('phone'); setOtpError(false); setPhoneError(''); setCanResend(false)
    setEmail(''); setPassword(''); setEmailError(''); setPasswordError(''); setShowPassword(false)
  }

  const handleEmailSubmit = async (e) => {
    e?.preventDefault()
    setEmailError(''); setPasswordError('')
    if (!email.trim()) { setEmailError('Enter your email address'); return }
    if (!password)     { setPasswordError('Enter your password');   return }
    setEmailLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const path = loginWithEmailPassword(email, password)
    setEmailLoading(false)
    if (path) navigate(path, { replace: true })
    else setEmailError('Email not registered or incorrect credentials.')
  }

  const handlePhoneSubmit = async (e) => {
    e?.preventDefault()
    setPhoneError('')
    const clean = phone.replace(/\D/g, '')
    if (clean.length !== 10) { setPhoneError('Enter a valid 10-digit mobile number'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = sendOTP(clean)
    setLoading(false)
    if (ok) { setStep('otp'); setCanResend(false); setResendKey(k => k + 1) }
    else setPhoneError('This number is not registered.')
  }

  const handleOTPComplete = useCallback(async (code) => {
    setLoading(true); setOtpError(false)
    await new Promise(r => setTimeout(r, 700))
    const ok = verifyOTP(code)
    setLoading(false)
    if (ok) navigate(useAuthStore.getState().getRedirectPath(), { replace: true })
    else setOtpError(true)
  }, [navigate, verifyOTP])

  const handleDemoLogin = (ph) => {
    const path = quickLogin(ph)
    if (path) navigate(path, { replace: true })
  }

  const maskedPhone = pendingPhone
    ? `+91 ${pendingPhone.slice(0, 5)} ${pendingPhone.slice(5)}`
    : ''

  const formKey = step === 'otp' ? 'otp' : loginMethod

  return (
    <motion.div
      key="login-page"
      className="min-h-screen flex"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EO } }}
    >
      {/* Left branding panel */}
      <LeftPanel />

      {/* Right form panel */}
      <div
        className="flex-1 lg:w-[40%] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 70% 15%, rgba(2,128,144,0.07) 0%, rgba(27,58,107,0.03) 45%, #fff 75%)' }}
      >
        {/* Subtle blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(2,128,144,0.06) 0%, transparent 70%)', transform: 'translate(35%,-35%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(27,58,107,0.05) 0%, transparent 70%)', transform: 'translate(-35%,35%)' }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-navy rounded-button flex items-center justify-center">
            <span className="text-white font-bold text-base">C</span>
          </div>
          <span className="font-bold text-xl text-primary">Cohort</span>
        </div>

        <div className="w-full max-w-[360px]">
          <p className="text-2xs uppercase tracking-wider text-secondary font-semibold mb-3">
            Platform Admin login
          </p>

              {/* Tab switcher */}
              <AnimatePresence>
                {step === 'phone' && (
                  <motion.div
                    className="flex rounded-button border border-border bg-surface p-1 mb-7"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: EO }}
                  >
                    {[
                      { id: 'otp',   label: 'Mobile OTP',      Icon: Smartphone },
                      { id: 'email', label: 'Email & Password', Icon: Mail       },
                    ].map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => switchMethod(id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-sm font-medium transition-all duration-150
                          ${loginMethod === id
                            ? 'bg-white text-teal shadow-sm border border-border'
                            : 'text-secondary hover:text-primary'}`}
                      >
                        <Icon size={13} /> {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form content — step-level AnimatePresence */}
              <AnimatePresence mode="wait">
                <motion.div key={formKey} variants={formV} initial="initial" animate="animate" exit="exit">

                  {/* ── OTP verification ── */}
                  {step === 'otp' && (
                    <div>
                      <button
                        onClick={() => { setStep('phone'); setOtpError(false) }}
                        className="flex items-center gap-1 text-secondary text-sm hover:text-teal transition-colors mb-6"
                      >
                        <ChevronLeft size={15} /> Back
                      </button>
                      <h2 className="text-[26px] font-bold text-primary mb-1.5 tracking-tight">Verify it's you</h2>
                      <p className="text-secondary text-sm mb-1">Enter the 6-digit code sent to</p>
                      <p className="text-primary font-semibold text-sm mb-7">{maskedPhone}</p>

                      <OTPInput key={resendKey} onComplete={handleOTPComplete} hasError={otpError} disabled={loading} />

                      {otpError && (
                        <motion.p
                          className="text-center text-xs text-danger mt-3 flex items-center justify-center gap-1"
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        >
                          <span>⚠</span> Incorrect OTP. Please try again.
                        </motion.p>
                      )}
                      {loading && (
                        <p className="text-center text-sm text-secondary mt-4 flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-teal/30 border-t-teal rounded-full animate-spin inline-block" />
                          Verifying…
                        </p>
                      )}
                      <div className="mt-6 text-center">
                        {!canResend ? (
                          <Countdown key={resendKey} seconds={30} onEnd={() => setCanResend(true)} />
                        ) : (
                          <button
                            onClick={() => {
                              const clean = pendingPhone || phone.replace(/\D/g, '')
                              setCanResend(false); setOtpError(false); setResendKey(k => k + 1)
                              sendOTP(clean)
                            }}
                            className="text-sm text-teal font-medium hover:text-teal-dark transition-colors flex items-center gap-1.5 mx-auto"
                          >
                            <RotateCcw size={13} /> Resend OTP
                          </button>
                        )}
                      </div>
                      <div className="mt-7 p-3 rounded-button bg-surface border border-border text-center">
                        <p className="text-2xs text-secondary">
                          <span className="text-teal font-medium">Demo tip:</span> Any 6 digits work (e.g. 123456)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Phone / OTP method ── */}
                  {step === 'phone' && loginMethod === 'otp' && (
                    <div>
                      <h2 className="text-[26px] font-bold text-primary mb-1.5 tracking-tight">Sign in</h2>
                      <p className="text-secondary text-sm mb-7">Enter your mobile number to continue</p>

                      <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                            Mobile Number
                          </label>
                          <div
                            className={`flex items-center border rounded-button bg-white transition-all duration-150 focus-within:border-teal
                              ${phoneError ? 'border-danger' : 'border-border hover:border-teal/40'}`}
                            style={{ height: 44, boxShadow: phoneError ? '0 0 0 3px rgba(191,54,12,0.08)' : undefined }}
                          >
                            <div className="flex items-center gap-1.5 pl-3 pr-3 border-r border-border flex-shrink-0">
                              <span className="text-base leading-none">🇮🇳</span>
                              <span className="text-sm font-medium text-secondary">+91</span>
                            </div>
                            <input
                              type="tel" inputMode="numeric" maxLength={10}
                              placeholder="98765 43210"
                              value={phone}
                              onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneError('') }}
                              className="flex-1 px-3 text-sm text-primary placeholder:text-secondary bg-transparent outline-none"
                              autoFocus
                            />
                          </div>
                          {phoneError && (
                            <p className="text-xs text-danger mt-1.5 flex items-center gap-1">
                              <span>⚠</span> {phoneError}
                            </p>
                          )}
                        </div>
                        <motion.button
                          type="submit"
                          disabled={loading || phone.length < 10}
                          className="btn-primary w-full"
                          whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                        >
                          {loading
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <>Continue <ArrowRight size={16} /></>}
                        </motion.button>
                      </form>

                      <div className="mt-7">
                        <p className="text-xs text-secondary text-center mb-3">Demo logins — tap to sign in instantly</p>
                        <div className="space-y-2">
                          {demoAccounts.map(acc => (
                            <button
                              key={acc.phone}
                              onClick={() => handleDemoLogin(acc.phone)}
                              className="w-full text-left p-3 rounded-button border border-border hover:border-teal hover:bg-teal/[0.03] transition-all duration-150 group flex items-center justify-between gap-3"
                            >
                              <div>
                                <span className="badge text-2xs mb-1.5" style={ROLE_STYLE_LIGHT[acc.role]}>{acc.label}</span>
                                <p className="text-xs font-medium text-primary group-hover:text-teal transition-colors leading-tight">{acc.name}</p>
                              </div>
                              <p className="text-2xs text-secondary mt-0.5 whitespace-nowrap">+91 {acc.phone}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Email & password ── */}
                  {step === 'phone' && loginMethod === 'email' && (
                    <div>
                      <h2 className="text-[26px] font-bold text-primary mb-1.5 tracking-tight">Sign in</h2>
                      <p className="text-secondary text-sm mb-7">Enter your email and password</p>

                      <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                            Email Address
                          </label>
                          <input
                            type="email" placeholder="you@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setEmailError('') }}
                            autoFocus
                            className={`w-full h-11 px-3 text-sm text-primary rounded-button border bg-white outline-none transition-all duration-150
                              placeholder:text-secondary
                              ${emailError ? 'border-danger' : 'border-border hover:border-teal/40 focus:border-teal'}`}
                            style={emailError ? { boxShadow: '0 0 0 3px rgba(191,54,12,0.08)' } : undefined}
                          />
                          {emailError && (
                            <p className="text-xs text-danger mt-1.5 flex items-center gap-1"><span>⚠</span> {emailError}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
                            Password
                          </label>
                          <div
                            className={`flex items-center border rounded-button bg-white transition-all duration-150 focus-within:border-teal
                              ${passwordError ? 'border-danger' : 'border-border hover:border-teal/40'}`}
                            style={{ height: 44, boxShadow: passwordError ? '0 0 0 3px rgba(191,54,12,0.08)' : undefined }}
                          >
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              value={password}
                              onChange={e => { setPassword(e.target.value); setPasswordError('') }}
                              className="flex-1 px-3 text-sm text-primary placeholder:text-secondary bg-transparent outline-none"
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                              className="px-3 text-secondary hover:text-primary transition-colors flex-shrink-0" tabIndex={-1}>
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {passwordError && (
                            <p className="text-xs text-danger mt-1.5 flex items-center gap-1"><span>⚠</span> {passwordError}</p>
                          )}
                        </div>
                        <motion.button
                          type="submit" disabled={emailLoading} className="btn-primary w-full"
                          whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                        >
                          {emailLoading
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <>Sign In <ArrowRight size={16} /></>}
                        </motion.button>
                      </form>

                      <div className="mt-7">
                        <p className="text-xs text-secondary text-center mb-3">Demo logins — tap to sign in instantly</p>
                        <div className="space-y-2">
                          {demoAccounts.map(acc => (
                            <button
                              key={acc.phone}
                              onClick={() => handleDemoLogin(acc.phone)}
                              className="w-full text-left p-3 rounded-button border border-border hover:border-teal hover:bg-teal/[0.03] transition-all duration-150 group flex items-center justify-between gap-3"
                            >
                              <div>
                                <span className="badge text-2xs mb-1.5" style={ROLE_STYLE_LIGHT[acc.role]}>{acc.label}</span>
                                <p className="text-xs font-medium text-primary group-hover:text-teal transition-colors leading-tight">{acc.name}</p>
                              </div>
                              <p className="text-2xs text-secondary mt-0.5 truncate">{acc.email}</p>
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 p-3 rounded-button bg-surface border border-border text-center">
                          <p className="text-2xs text-secondary">
                            <span className="text-teal font-medium">Demo tip:</span> Enter any password — all use{' '}
                            <span className="font-medium text-primary">Demo@1234</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
        </div>

        <p className="mt-auto pt-8 text-2xs text-secondary text-center">
          © 2026 Cohort · Community Networking Platform
        </p>
      </div>
    </motion.div>
  )
}
