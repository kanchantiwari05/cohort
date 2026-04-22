export const users = [
  {
    id: 'pa-001',
    name: 'Jatin Dudhat',
    email: 'jatin@cnp.app',
    phone: '9876543210',
    password: 'Demo@1234',
    role: 'platform_admin',
    avatar: null,
    createdAt: '2024-01-01',
  },
  {
    id: 'csa-001',
    name: 'Rajesh Mehta',
    email: 'rajesh@bnimumbai.com',
    phone: '9823456789',
    password: 'Demo@1234',
    role: 'community_super_admin',
    communityId: 'comm-001',
    communityName: 'BNI Mumbai Metro',
    avatar: null,
    createdAt: '2024-02-15',
  },
  {
    id: 'la-001',
    name: 'Priya Sharma',
    email: 'priya@bnimumbai.com',
    phone: '9867543210',
    password: 'Demo@1234',
    role: 'level_admin',
    communityId: 'comm-001',
    communityName: 'BNI Mumbai Metro',
    nodeId: 'chapter-001',
    nodeName: 'Andheri Chapter',
    avatar: null,
    createdAt: '2024-02-20',
  },
  {
    id: 'la-002',
    name: 'Vikram Nair',
    email: 'vikram@bnimumbai.com',
    phone: '9845612378',
    password: 'Demo@1234',
    role: 'level_admin',
    communityId: 'comm-001',
    communityName: 'BNI Mumbai Metro',
    nodeId: 'chapter-002',
    nodeName: 'Bandra Chapter',
    avatar: null,
    createdAt: '2024-02-20',
  },
  {
    id: 'mem-001',
    name: 'Amit Desai',
    email: 'amit@desaitech.com',
    phone: '9812345678',
    password: 'Demo@1234',
    role: 'member',
    communityId: 'comm-001',
    communityName: 'BNI Mumbai Metro',
    nodeId: 'chapter-001',
    nodeName: 'Andheri Chapter',
    businessName: 'Desai Technologies',
    category: 'IT Services',
    avatar: null,
    engagementScore: 87,
    createdAt: '2024-03-01',
  },
]

export function loginUser(phone) {
  return users.find(u => u.phone === phone) || null
}

// Demo app: accepts any non-empty password (consistent with OTP accepting any 6 digits)
export function loginWithEmail(email) {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export const demoAccounts = [
  { label: 'Platform Admin', name: 'Jatin Dudhat',  phone: '9876543210', email: 'jatin@cnp.app',         role: 'platform_admin'        },
  { label: 'Super Admin',    name: 'Rajesh Mehta',  phone: '9823456789', email: 'rajesh@bnimumbai.com',  role: 'community_super_admin' },
  { label: 'Level Admin',    name: 'Priya Sharma',  phone: '9867543210', email: 'priya@bnimumbai.com',   role: 'level_admin'           },
  { label: 'Member',         name: 'Amit Desai',    phone: '9812345678', email: 'amit@desaitech.com',    role: 'member'                },
]
