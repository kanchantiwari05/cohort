import { create } from 'zustand'
import toast from 'react-hot-toast'
import { loginUser, loginWithEmail } from '../data/users'

export const roleRedirectMap = {
  platform_admin:        '/admin/dashboard',
  community_super_admin: '/csa/dashboard',
  level_admin:           '/la/dashboard',
  member:                '/member/dashboard',
}

const useAuthStore = create((set, get) => ({
  currentUser:     null,
  isAuthenticated: false,
  otpSent:         false,
  pendingPhone:    null,

  sendOTP: (phone) => {
    const user = loginUser(phone)
    if (!user) {
      toast.error('Phone number not registered.')
      return false
    }
    set({ otpSent: true, pendingPhone: phone })
    const masked = `+91-${phone.slice(0, 2)}${'X'.repeat(6)}${phone.slice(-2)}`
    toast.success(`OTP sent to ${masked}`)
    return true
  },

  verifyOTP: (otp) => {
    // accept any 6-digit number as valid OTP
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Enter a valid 6-digit OTP')
      return false
    }
    const { pendingPhone } = get()
    const user = loginUser(pendingPhone)
    if (!user) {
      toast.error('Session expired. Please try again.')
      set({ otpSent: false, pendingPhone: null })
      return false
    }
    set({ currentUser: user, isAuthenticated: true, otpSent: false, pendingPhone: null })
    toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`)
    return true
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false, otpSent: false, pendingPhone: null })
    toast.success('Signed out successfully')
  },

  getRedirectPath: () => {
    const { currentUser } = get()
    return roleRedirectMap[currentUser?.role] || '/login'
  },

  // email + password login (demo: any non-empty password accepted)
  loginWithEmailPassword: (email, password) => {
    if (!email.trim()) {
      toast.error('Enter your email address')
      return null
    }
    if (!password) {
      toast.error('Enter your password')
      return null
    }
    const user = loginWithEmail(email)
    if (!user) {
      toast.error('Email not registered.')
      return null
    }
    set({ currentUser: user, isAuthenticated: true, otpSent: false, pendingPhone: null })
    toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`)
    return roleRedirectMap[user.role] || '/login'
  },

  // instant demo login — bypasses OTP flow
  quickLogin: (phone) => {
    const user = loginUser(phone)
    if (!user) return
    set({ currentUser: user, isAuthenticated: true, otpSent: false, pendingPhone: null })
    return roleRedirectMap[user.role] || '/login'
  },
}))

export default useAuthStore
