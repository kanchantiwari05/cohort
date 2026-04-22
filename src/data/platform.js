// ── Tenants ──────────────────────────────────────────────────────────────────
export const tenants = [
  {
    id: 'comm-001', name: 'BNI Mumbai Metro',       type: 'Professional Networking',
    members: 240,  status: 'active',    domain: 'bnimumbai.cnp.app',
    createdAt: '2024-02-15', csa: { name: 'Rajesh Mehta', phone: '9823456789', email: 'rajesh@bnimumbai.com' },
    hierarchy: { levels: ['Zone','Chapter','Group'], zones: 2, chapters: 8, groups: 24 },
    modules: { referrals:true, meetings:true, events:true, oneOnOne:true, feed:true, analytics:true },
    activeThisMonth: 180, referralsThisMonth: 48, meetingsHeld: 16,
    storage: '2.4 GB', errorRate: '0.02%', healthScore: 98,
  },
  {
    id: 'comm-002', name: 'Alumni IIT Bombay',      type: 'Alumni',
    members: 580,  status: 'active',    domain: 'iitbombai.cnp.app',
    createdAt: '2024-02-22', csa: { name: 'Sudhir Kulkarni', phone: '9811234567', email: 'sudhir@iitbaa.org' },
    hierarchy: { levels: ['Batch','City','Group'], zones: 5, chapters: 18, groups: 0 },
    modules: { referrals:true, meetings:true, events:true, oneOnOne:true, feed:true, analytics:true },
    activeThisMonth: 412, referralsThisMonth: 22, meetingsHeld: 8,
    storage: '5.1 GB', errorRate: '0.08%', healthScore: 94,
  },
  {
    id: 'comm-003', name: 'FICCI Gujarat',           type: 'Trade Body',
    members: 120,  status: 'pending',   domain: 'ficcigujarat.cnp.app',
    createdAt: '2024-04-01', csa: { name: 'Anand Patel', phone: '9867001234', email: 'anand@ficci-guj.in' },
    hierarchy: { levels: ['Region','District'], zones: 3, chapters: 0, groups: 0 },
    modules: { referrals:true, meetings:true, events:true, oneOnOne:false, feed:false, analytics:false },
    activeThisMonth: 0, referralsThisMonth: 0, meetingsHeld: 0,
    storage: '0.1 GB', errorRate: 'N/A', healthScore: 60,
  },
  {
    id: 'comm-004', name: 'Mumbai Realtors Club',    type: 'Professional',
    members: 95,   status: 'active',    domain: 'mumabrealtors.cnp.app',
    createdAt: '2024-03-10', csa: { name: 'Preethi Nair', phone: '9845001122', email: 'preethi@mrc.in' },
    hierarchy: { levels: ['Zone','Chapter'], zones: 2, chapters: 6, groups: 0 },
    modules: { referrals:true, meetings:true, events:true, oneOnOne:false, feed:true, analytics:false },
    activeThisMonth: 71, referralsThisMonth: 31, meetingsHeld: 12,
    storage: '1.2 GB', errorRate: '0.05%', healthScore: 91,
  },
  {
    id: 'comm-005', name: 'CII Maharashtra',         type: 'Trade Body',
    members: 310,  status: 'active',    domain: 'ciimaha.cnp.app',
    createdAt: '2024-01-05', csa: { name: 'Ramesh Joshi', phone: '9823300011', email: 'ramesh@cii-maha.in' },
    hierarchy: { levels: ['Division','Circle'], zones: 4, chapters: 14, groups: 0 },
    modules: { referrals:false, meetings:true, events:true, oneOnOne:true, feed:true, analytics:true },
    activeThisMonth: 228, referralsThisMonth: 0, meetingsHeld: 9,
    storage: '3.8 GB', errorRate: '0.03%', healthScore: 96,
  },
  {
    id: 'comm-006', name: 'Alumni VJTI',             type: 'Alumni',
    members: 430,  status: 'active',    domain: 'alumvjti.cnp.app',
    createdAt: '2024-02-18', csa: { name: 'Deepak Shetty', phone: '9856001234', email: 'deepak@vjtialumni.org' },
    hierarchy: { levels: ['Batch','City'], zones: 3, chapters: 9, groups: 0 },
    modules: { referrals:true, meetings:false, events:true, oneOnOne:true, feed:true, analytics:false },
    activeThisMonth: 315, referralsThisMonth: 18, meetingsHeld: 0,
    storage: '4.2 GB', errorRate: '0.06%', healthScore: 92,
  },
  {
    id: 'comm-007', name: 'BNI Pune',               type: 'Professional Networking',
    members: 185,  status: 'active',    domain: 'bnipune.cnp.app',
    createdAt: '2024-02-28', csa: { name: 'Kaveri Jain', phone: '9812009988', email: 'kaveri@bnipune.com' },
    hierarchy: { levels: ['Zone','Chapter','Group'], zones: 2, chapters: 6, groups: 18 },
    modules: { referrals:true, meetings:true, events:true, oneOnOne:true, feed:true, analytics:true },
    activeThisMonth: 141, referralsThisMonth: 36, meetingsHeld: 12,
    storage: '1.9 GB', errorRate: '0.04%', healthScore: 95,
  },
  {
    id: 'comm-008', name: 'Entrepreneurs Club',     type: 'Professional',
    members: 67,   status: 'suspended', domain: 'entclub.cnp.app',
    createdAt: '2024-03-12', csa: { name: 'Nitin Verma', phone: '9867100200', email: 'nitin@entclub.in' },
    hierarchy: { levels: ['City'], zones: 1, chapters: 0, groups: 0 },
    modules: { referrals:false, meetings:false, events:true, oneOnOne:false, feed:true, analytics:false },
    activeThisMonth: 0, referralsThisMonth: 0, meetingsHeld: 0,
    storage: '0.8 GB', errorRate: 'N/A', healthScore: 22,
  },
]

// ── Domains ──────────────────────────────────────────────────────────────────
export const domains = tenants.map(t => ({
  id: t.id,
  community: t.name,
  domain: t.domain,
  status: t.status === 'pending' ? 'pending_dns' : t.status === 'suspended' ? 'failed' : 'active',
  ssl: t.status === 'active',
  createdAt: t.createdAt,
}))

export const takenSubdomains = ['bnimumbai','iitbombai','ficcigujarat','mumabrealtors','ciimaha','alumvjti','bnipune','entclub']

// ── Activity feed ────────────────────────────────────────────────────────────
export const activityFeed = [
  { id:'a1',  text:'BNI Mumbai Metro went live',                   time:'2 hours ago',  dot:'bg-success' },
  { id:'a2',  text:'New tenant provisioned: FICCI Gujarat',        time:'5 hours ago',  dot:'bg-teal'    },
  { id:'a3',  text:'App build completed: Alumni IIT Bombay',       time:'1 day ago',    dot:'bg-navy'    },
  { id:'a4',  text:'Support ticket escalated: BNI Pune — login issue', time:'2 days ago', dot:'bg-warning' },
  { id:'a5',  text:'Billing renewed: Mumbai Realtors Club',        time:'3 days ago',   dot:'bg-success' },
  { id:'a6',  text:'Hierarchy updated: CII Maharashtra',           time:'3 days ago',   dot:'bg-teal'    },
  { id:'a7',  text:'New CSA onboarded: Alumni VJTI',               time:'4 days ago',   dot:'bg-navy'    },
  { id:'a8',  text:'Domain provisioned: bnipune.cnp.app',          time:'5 days ago',   dot:'bg-success' },
]

// ── Charts ───────────────────────────────────────────────────────────────────
export const tenantGrowthData = [
  { month:'Nov', tenants:1 },
  { month:'Dec', tenants:2 },
  { month:'Jan', tenants:1 },
  { month:'Feb', tenants:3 },
  { month:'Mar', tenants:2 },
  { month:'Apr', tenants:2 },
]

export const communityTypesData = [
  { name:'Professional',  value:5 },
  { name:'Alumni',        value:3 },
  { name:'Trade Body',    value:2 },
  { name:'Corporate',     value:2 },
]

// ── Health ────────────────────────────────────────────────────────────────────
export const apiResponseTimeData = [
  {h:'00:00',ms:210},{h:'01:00',ms:198},{h:'02:00',ms:185},{h:'03:00',ms:182},
  {h:'04:00',ms:190},{h:'05:00',ms:204},{h:'06:00',ms:230},{h:'07:00',ms:278},
  {h:'08:00',ms:315},{h:'09:00',ms:298},{h:'10:00',ms:260},{h:'11:00',ms:245},
  {h:'12:00',ms:285},{h:'13:00',ms:310},{h:'14:00',ms:850},{h:'15:00',ms:290},
  {h:'16:00',ms:255},{h:'17:00',ms:240},{h:'18:00',ms:220},{h:'19:00',ms:215},
  {h:'20:00',ms:208},{h:'21:00',ms:202},{h:'22:00',ms:195},{h:'23:00',ms:188},
]

export const otpDeliveryData = [
  { carrier:'Airtel', rate:99.2 },
  { carrier:'Jio',    rate:98.8 },
  { carrier:'Vi',     rate:97.4 },
  { carrier:'BSNL',   rate:94.1 },
]

export const systemServices = [
  { name:'API Server',      status:'online',      latency:'218ms' },
  { name:'Database',        status:'online',      latency:'12ms'  },
  { name:'OTP Service',     status:'online',      latency:'340ms' },
  { name:'App Store Build', status:'in_progress', latency:'—'     },
]

// ── Dashboard v2 data ────────────────────────────────────────────────────────

export const tenantAreaData = [
  { month: 'Nov', count: 6 },
  { month: 'Dec', count: 7 },
  { month: 'Jan', count: 8 },
  { month: 'Feb', count: 9 },
  { month: 'Mar', count: 11 },
  { month: 'Apr', count: 12 },
]

export const dashboardCommunityTypes = [
  { name: 'Professional Networking', value: 5, color: '#1B3A6B' },
  { name: 'Alumni',                  value: 3, color: '#028090' },
  { name: 'Trade Body',              value: 2, color: '#E6A817' },
  { name: 'Religious',               value: 1, color: '#7C3AED' },
  { name: 'Corporate',               value: 1, color: '#2E7D32' },
]

export const dashboardActivityFeed = [
  { id: 'da1',  text: 'BNI Mumbai Metro — 12 new members activated',  time: '2 hours ago', type: 'members',   unread: true  },
  { id: 'da2',  text: 'FICCI Gujarat tenant provisioned',              time: '5 hours ago', type: 'provision', unread: true  },
  { id: 'da3',  text: 'App build completed: Alumni IIT Bombay',        time: '1 day ago',   type: 'build',     unread: true  },
  { id: 'da4',  text: 'Support ticket escalated: BNI Pune',            time: '2 days ago',  type: 'support',   unread: false },
  { id: 'da5',  text: 'Billing renewed: CII Maharashtra ₹20,000',      time: '3 days ago',  type: 'billing',   unread: false },
  { id: 'da6',  text: 'New lead: Rotary Club Mumbai',                  time: '3 days ago',  type: 'lead',      unread: false },
  { id: 'da7',  text: 'Hierarchy configured: FICCI Gujarat',           time: '4 days ago',  type: 'hierarchy', unread: false },
  { id: 'da8',  text: 'App Store approved: BNI Pune',                  time: '5 days ago',  type: 'appstore',  unread: false },
  { id: 'da9',  text: 'Low engagement alert: Entrepreneurs Club',      time: '6 days ago',  type: 'alert',     unread: false },
  { id: 'da10', text: 'Domain provisioned: bnipune.cnp.app',           time: '7 days ago',  type: 'domain',    unread: false },
]

export const topCommunitiesData = [
  { name: 'BNI Mumbai Metro',   members: 240, referrals: 312, revenue: '₹18.4L', meetings: 32, healthScore: 94 },
  { name: 'CII Maharashtra',    members: 310, referrals: 287, revenue: '₹24.1L', meetings: 28, healthScore: 91 },
  { name: 'Alumni IIT Bombay',  members: 580, referrals: 198, revenue: '₹8.2L',  meetings: 18, healthScore: 88 },
  { name: 'BNI Pune',           members: 185, referrals: 245, revenue: '₹14.8L', meetings: 26, healthScore: 86 },
  { name: 'Alumni VJTI',        members: 430, referrals: 156, revenue: '₹6.1L',  meetings: 14, healthScore: 85 },
  { name: 'Mumbai Realtors',    members: 95,  referrals: 178, revenue: '₹11.2L', meetings: 22, healthScore: 82 },
  { name: 'FICCI Gujarat',      members: 120, referrals:  89, revenue: '₹4.5L',  meetings:  8, healthScore: 60 },
  { name: 'Entrepreneurs Club', members:  67, referrals:  32, revenue: '₹1.8L',  meetings:  4, healthScore: 22 },
]

// ── Hierarchy (BNI Mumbai Metro) ──────────────────────────────────────────────
export const hierarchyData = {
  'comm-001': {
    levels: ['Zone', 'Chapter', 'Group'],
    tree: [
      {
        id:'z1', name:'North Zone', level:'Zone', levelAdmin:null, memberCount:0,
        children:[
          {
            id:'c1', name:'Andheri Chapter', level:'Chapter', levelAdmin:'Priya Sharma', memberCount:32,
            children:[
              { id:'g1', name:'Morning Group', level:'Group', levelAdmin:null,        memberCount:16, children:[] },
              { id:'g2', name:'Evening Group', level:'Group', levelAdmin:'Suresh K.', memberCount:16, children:[] },
            ],
          },
          {
            id:'c2', name:'Borivali Chapter', level:'Chapter', levelAdmin:null, memberCount:28,
            children:[
              { id:'g3', name:'Business Group', level:'Group', levelAdmin:null, memberCount:14, children:[] },
              { id:'g4', name:'Weekend Group',  level:'Group', levelAdmin:null, memberCount:14, children:[] },
            ],
          },
        ],
      },
      {
        id:'z2', name:'South Zone', level:'Zone', levelAdmin:null, memberCount:0,
        children:[
          {
            id:'c3', name:'Bandra Chapter', level:'Chapter', levelAdmin:'Vikram Nair', memberCount:30,
            children:[
              { id:'g5', name:'Alpha Group', level:'Group', levelAdmin:null, memberCount:15, children:[] },
              { id:'g6', name:'Beta Group',  level:'Group', levelAdmin:null, memberCount:15, children:[] },
            ],
          },
          {
            id:'c4', name:'Worli Chapter', level:'Chapter', levelAdmin:null, memberCount:25,
            children:[
              { id:'g7', name:'Core Group',   level:'Group', levelAdmin:null, memberCount:12, children:[] },
              { id:'g8', name:'Growth Group', level:'Group', levelAdmin:null, memberCount:13, children:[] },
            ],
          },
        ],
      },
    ],
  },
}
