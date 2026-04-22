import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ── ALL MODULE IDS ────────────────────────────────────────────────────────────
export const ALL_MODULES = [
  {
    id: 'member_management',
    name: 'Member Management',
    shortName: 'Members',
    description: 'Profiles, directory, visitor pipeline, digital member ID, bulk import',
    icon: 'users',
    category: 'core',
    alwaysOn: true,
    color: '#028090',
    sortOrder: 1,
  },
  {
    id: 'meeting_management',
    name: 'Meeting Management',
    shortName: 'Meetings',
    description: 'Create meetings, RSVP, recurring schedules, meeting calendar',
    icon: 'calendar',
    category: 'engagement',
    alwaysOn: false,
    color: '#1565C0',
    sortOrder: 2,
  },
  {
    id: 'attendance_management',
    name: 'Attendance Management',
    shortName: 'Attendance',
    description: 'Mark attendance, QR check-in, attendance reports, strict mode',
    icon: 'clipboard-check',
    category: 'engagement',
    alwaysOn: false,
    color: '#6A1B9A',
    sortOrder: 3,
  },
  {
    id: 'event_management',
    name: 'Event Management',
    shortName: 'Events',
    description: 'Create events, RSVP, participation tracking, event analytics',
    icon: 'star',
    category: 'engagement',
    alwaysOn: false,
    color: '#BF360C',
    sortOrder: 4,
  },
  {
    id: 'referral_business',
    name: 'Referral & Business Tracking',
    shortName: 'Referrals',
    description: 'Referral pipeline, TYFCB, closed business value, leaderboards',
    icon: 'trending-up',
    category: 'business',
    alwaysOn: false,
    color: '#C17900',
    sortOrder: 5,
  },
  {
    id: 'communication_hub',
    name: 'Communication Hub',
    shortName: 'Communication',
    description: 'Announcements, forums, WhatsApp templates, notification matrix',
    icon: 'message-circle',
    category: 'core',
    alwaysOn: true,
    color: '#028090',
    sortOrder: 6,
  },
  {
    id: 'one_to_one',
    name: 'One-to-One Meetings',
    shortName: '1:1 Meetings',
    description: 'Log 1:1 meetings, partner confirmation, monthly targets tracking',
    icon: 'users',
    category: 'business',
    alwaysOn: false,
    color: '#1565C0',
    sortOrder: 7,
  },
  {
    id: 'dashboard_analytics',
    name: 'Dashboard & Analytics',
    shortName: 'Dashboard',
    description: 'Personal KPIs, node dashboards, community analytics, CSV/PDF exports',
    icon: 'bar-chart-2',
    category: 'core',
    alwaysOn: true,
    color: '#1B3A6B',
    sortOrder: 8,
  },
  {
    id: 'activity_feed',
    name: 'Activity Feed & Moderation',
    shortName: 'Activity Feed',
    description: 'Social feed, member posts, moderation queue, flag and escalation',
    icon: 'layout',
    category: 'engagement',
    alwaysOn: false,
    color: '#6A1B9A',
    sortOrder: 9,
  },
  {
    id: 'networking_groups',
    name: 'Networking & Groups',
    shortName: 'Networking',
    description: 'Member connections, sub-groups, group leaders, cross-node directory',
    icon: 'network',
    category: 'engagement',
    alwaysOn: false,
    color: '#2E7D32',
    sortOrder: 10,
  },
  {
    id: 'automation',
    name: 'Automation & Nudges',
    shortName: 'Automation',
    description: 'Trigger-based rules, engagement nudges, lifecycle management, auto-logs',
    icon: 'zap',
    category: 'core',
    alwaysOn: true,
    color: '#2E7D32',
    sortOrder: 11,
  },
  {
    id: 'support_help',
    name: 'Support & Help',
    shortName: 'Support',
    description: 'FAQ library, member tickets, Level Admin review, PA escalation',
    icon: 'headphones',
    category: 'core',
    alwaysOn: true,
    color: '#546E7A',
    sortOrder: 12,
  },
]

const DEFAULT_PLANS = [
  {
    id: 'plan-starter',
    name: 'Starter',
    slug: 'starter',
    price: 12000,
    billingCycle: 'monthly',
    trialDays: 0,
    maxMembers: 100,
    maxMembersUnlimited: false,
    maxNodes: 5,
    maxNodesUnlimited: false,
    maxLevels: 2,
    maxLevelsUnlimited: false,
    isActive: true,
    isRecommended: false,
    color: '#546E7A',
    description: 'Perfect for small communities just getting started',
    allowedModuleIds: [
      'member_management',
      'communication_hub',
      'dashboard_analytics',
      'automation',
      'support_help',
      'meeting_management',
      'attendance_management',
    ],
    createdAt: '2024-01-01',
    tenantsCount: 3,
  },
  {
    id: 'plan-professional',
    name: 'Professional',
    slug: 'professional',
    price: 25000,
    billingCycle: 'monthly',
    trialDays: 7,
    maxMembers: 500,
    maxMembersUnlimited: false,
    maxNodes: 25,
    maxNodesUnlimited: false,
    maxLevels: 4,
    maxLevelsUnlimited: false,
    isActive: true,
    isRecommended: true,
    color: '#028090',
    description: 'For growing communities that need full module access',
    allowedModuleIds: [
      'member_management',
      'communication_hub',
      'dashboard_analytics',
      'automation',
      'support_help',
      'meeting_management',
      'attendance_management',
      'event_management',
      'referral_business',
      'one_to_one',
      'activity_feed',
    ],
    createdAt: '2024-01-01',
    tenantsCount: 6,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    price: 45000,
    billingCycle: 'monthly',
    trialDays: 14,
    maxMembers: null,
    maxMembersUnlimited: true,
    maxNodes: null,
    maxNodesUnlimited: true,
    maxLevels: null,
    maxLevelsUnlimited: true,
    isActive: true,
    isRecommended: false,
    color: '#1B3A6B',
    description: 'Unlimited scale for large federations and associations',
    allowedModuleIds: 'all',
    createdAt: '2024-01-01',
    tenantsCount: 3,
  },
]

const DEFAULT_COMMUNITY_TYPES = [
  {
    id: 'ct-professional',
    name: 'Professional Networking',
    slug: 'professional_networking',
    examples: 'BNI, Rotary, Lions Club, Toastmasters',
    description: 'Business referral and networking communities',
    color: '#028090',
    icon: 'briefcase',
    defaultHierarchyPreset: {
      levels: [
        { index: 0, name: 'Zone', color: '#1B3A6B' },
        { index: 1, name: 'Chapter', color: '#028090' },
        { index: 2, name: 'Group', color: '#C17900' },
      ],
      nodes: [],
    },
    recommendedModuleIds: [
      'meeting_management',
      'attendance_management',
      'referral_business',
      'one_to_one',
    ],
    suggestedPlanSlug: 'professional',
    isActive: true,
    sortOrder: 1,
    tenantsUsing: 5,
  },
  {
    id: 'ct-alumni',
    name: 'Alumni Association',
    slug: 'alumni',
    examples: 'IIT Alumni, College Networks, University Associations',
    description: 'Graduate and alumni networking communities',
    color: '#1565C0',
    icon: 'book-open',
    defaultHierarchyPreset: {
      levels: [
        { index: 0, name: 'University', color: '#1B3A6B' },
        { index: 1, name: 'Campus', color: '#028090' },
        { index: 2, name: 'Batch', color: '#C17900' },
      ],
      nodes: [],
    },
    recommendedModuleIds: [
      'event_management',
      'activity_feed',
      'networking_groups',
    ],
    suggestedPlanSlug: 'professional',
    isActive: true,
    sortOrder: 2,
    tenantsUsing: 2,
  },
  {
    id: 'ct-trade',
    name: 'Trade Association',
    slug: 'trade_association',
    examples: 'FICCI, CII, Industry Bodies, Chambers of Commerce',
    description: 'Industry and trade body communities',
    color: '#C17900',
    icon: 'building',
    defaultHierarchyPreset: {
      levels: [
        { index: 0, name: 'Federation', color: '#1B3A6B' },
        { index: 1, name: 'State Body', color: '#028090' },
        { index: 2, name: 'District', color: '#C17900' },
        { index: 3, name: 'Committee', color: '#2E7D32' },
      ],
      nodes: [],
    },
    recommendedModuleIds: [
      'meeting_management',
      'event_management',
      'referral_business',
    ],
    suggestedPlanSlug: 'enterprise',
    isActive: true,
    sortOrder: 3,
    tenantsUsing: 1,
  },
  {
    id: 'ct-religious',
    name: 'Religious / Spiritual',
    slug: 'religious',
    examples: 'Temple Trusts, Religious Orgs, Spiritual Communities',
    description: 'Faith-based and spiritual communities',
    color: '#6A1B9A',
    icon: 'star',
    defaultHierarchyPreset: {
      levels: [
        { index: 0, name: 'Country', color: '#1B3A6B' },
        { index: 1, name: 'State', color: '#6A1B9A' },
        { index: 2, name: 'City', color: '#028090' },
        { index: 3, name: 'Temple Shakha', color: '#C17900' },
      ],
      nodes: [],
    },
    recommendedModuleIds: [
      'meeting_management',
      'attendance_management',
      'event_management',
      'activity_feed',
    ],
    suggestedPlanSlug: 'professional',
    isActive: true,
    sortOrder: 4,
    tenantsUsing: 0,
  },
  {
    id: 'ct-corporate',
    name: 'Corporate Internal',
    slug: 'corporate',
    examples: 'Company ERGs, Internal Networks, Department Communities',
    description: 'Internal corporate communities and employee groups',
    color: '#1B3A6B',
    icon: 'monitor',
    defaultHierarchyPreset: {
      levels: [
        { index: 0, name: 'Region', color: '#1B3A6B' },
        { index: 1, name: 'Division', color: '#028090' },
        { index: 2, name: 'Team', color: '#C17900' },
      ],
      nodes: [],
    },
    recommendedModuleIds: [
      'meeting_management',
      'attendance_management',
    ],
    suggestedPlanSlug: 'starter',
    isActive: true,
    sortOrder: 5,
    tenantsUsing: 0,
  },
  {
    id: 'ct-flat',
    name: 'Flat Community',
    slug: 'flat',
    examples: 'Small Clubs, Local Groups, Interest Communities',
    description: 'Single-level community with no sub-groups',
    color: '#546E7A',
    icon: 'users',
    defaultHierarchyPreset: {
      levels: [
        { index: 0, name: 'Community', color: '#1B3A6B' },
      ],
      nodes: [],
    },
    recommendedModuleIds: [
      'meeting_management',
    ],
    suggestedPlanSlug: 'starter',
    isActive: true,
    sortOrder: 6,
    tenantsUsing: 0,
  },
]

const DEFAULT_CHECKLIST_TEMPLATE = [
  {
    id: 'cht-1',
    stepNumber: 1,
    label: 'Tenant Provisioned',
    description: 'Subdomain created and data environment set up for the community',
    owner: 'platform_admin',
    expectedDays: 0,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: 'on_tenant_created',
  },
  {
    id: 'cht-2',
    stepNumber: 2,
    label: 'Branding Assets Uploaded',
    description: 'Logo, colors, fonts, app icon and splash screen configured',
    owner: 'platform_admin',
    expectedDays: 2,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: null,
  },
  {
    id: 'cht-3',
    stepNumber: 3,
    label: 'Hierarchy Configured',
    description: 'All hierarchy levels defined and all nodes created',
    owner: 'platform_admin',
    expectedDays: 2,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: null,
  },
  {
    id: 'cht-4',
    stepNumber: 4,
    label: 'Level Admins Assigned',
    description: 'Every hierarchy node has an assigned Level Admin',
    owner: 'platform_admin',
    expectedDays: 3,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: null,
  },
  {
    id: 'cht-5',
    stepNumber: 5,
    label: 'CSA Credentials Delivered',
    description: 'OTP invitation sent to Community Super Admin',
    owner: 'platform_admin',
    expectedDays: 4,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: 'on_csa_invited',
  },
  {
    id: 'cht-6',
    stepNumber: 6,
    label: 'Modules Configured by CSA',
    description: 'CSA has logged in and enabled the correct modules',
    owner: 'csa',
    expectedDays: 7,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: null,
  },
  {
    id: 'cht-7',
    stepNumber: 7,
    label: 'Member Import Completed',
    description: 'All members uploaded via CSV and OTP invites sent',
    owner: 'csa',
    expectedDays: 8,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: null,
  },
  {
    id: 'cht-8',
    stepNumber: 8,
    label: 'App Build Triggered',
    description: 'iOS and Android build pipeline started for this tenant',
    owner: 'platform_admin',
    expectedDays: 5,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: 'on_build_triggered',
  },
  {
    id: 'cht-9',
    stepNumber: 9,
    label: 'App Store Approved',
    description: 'Both iOS and Android apps live in their respective stores',
    owner: 'platform_admin',
    expectedDays: 18,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: null,
  },
  {
    id: 'cht-10',
    stepNumber: 10,
    label: 'Go-Live Verified',
    description: 'All flows tested, 50% members activated, first meeting created',
    owner: 'platform_admin',
    expectedDays: 21,
    isRequired: true,
    isActive: true,
    autoCompleteTrigger: null,
  },
]

const DEFAULT_NOTIFICATION_TEMPLATES = {
  whatsapp: {
    otp: {
      id: 'wa-otp',
      name: 'OTP Verification',
      trigger: 'On every OTP request',
      message:
        'Your {{platformName}} verification code is: *{{otp}}*\nValid for {{expiry}} minutes. Do not share this with anyone.',
    },
    welcomeMember: {
      id: 'wa-welcome',
      name: 'Welcome Member',
      trigger: 'On member account activation',
      message:
        'Welcome to *{{communityName}}*! 🎉\nYour account is now active.\nDownload the app: {{appLink}}',
    },
    csaInvite: {
      id: 'wa-csa',
      name: 'CSA Portal Invite',
      trigger: 'On CSA credential delivery',
      message:
        'Hi {{name}}, your community *{{communityName}}* is ready!\nLog in to your portal: {{portalLink}}\nUse OTP on your registered number.',
    },
    billingReminder: {
      id: 'wa-billing',
      name: 'Billing Reminder',
      trigger: '7 days before invoice due date',
      message:
        'Hi {{name}}, your CNP invoice of *₹{{amount}}* for {{period}} is due on {{dueDate}}.\nPay now to avoid service interruption.',
    },
    goLiveAlert: {
      id: 'wa-golive',
      name: 'Go-Live Alert',
      trigger: 'On go-live verification complete',
      message:
        'Congratulations! 🚀\n*{{communityName}}* is now live!\niOS: {{iosLink}}\nAndroid: {{androidLink}}',
    },
    atRiskNudge: {
      id: 'wa-atrisk',
      name: 'At-Risk Member Nudge',
      trigger: 'After 14 days of inactivity',
      message:
        "Hi {{name}}, we miss you in *{{communityName}}*! 👋\nLog in and see what's happening:\n{{appLink}}",
    },
    weeklyDigest: {
      id: 'wa-digest',
      name: 'Weekly Digest',
      trigger: 'Every Monday 8:00 AM',
      message:
        'Hi {{name}}! This week in *{{communityName}}*:\n🤝 {{referralCount}} referrals logged\n📅 {{meetingCount}} meetings held\nOpen app: {{appLink}}',
    },
    laChecklist: {
      id: 'wa-checklist',
      name: 'Onboarding Nudge to CSA',
      trigger: 'When checklist step stalls 7+ days',
      message:
        "Hi {{name}}, a friendly reminder to complete *{{stepName}}* for your {{communityName}} setup.\nYou're almost live! 🚀",
    },
  },
  email: {
    subjectPrefix: '[CNP]',
    welcomeSubject: 'Welcome to {{communityName}} — Your account is ready',
    invoiceSubject: 'Invoice #{{invoiceNumber}} — {{communityName}} — {{period}}',
    reminderSubject: 'Payment Reminder — {{communityName}} — Due {{dueDate}}',
    csaInviteSubject: 'Your community is ready — {{communityName}}',
  },
}

const DEFAULT_PLATFORM_IDENTITY = {
  name: 'Community Networking Platform',
  shortName: 'CNP',
  tagline: 'Connect. Measure. Grow.',
  supportEmail: 'support@cnp.app',
  supportWhatsApp: '+91 98765 43210',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  currencySymbol: '₹',
  language: 'en',
  logoUrl: null,
  updatedAt: null,
}

const useMasterSettingsStore = create(
  persist(
    (set, get) => ({
      plans: DEFAULT_PLANS,
      modules: [...ALL_MODULES].sort((a, b) => a.sortOrder - b.sortOrder),
      communityTypes: DEFAULT_COMMUNITY_TYPES,
      checklistTemplate: DEFAULT_CHECKLIST_TEMPLATE,
      notificationTemplates: JSON.parse(JSON.stringify(DEFAULT_NOTIFICATION_TEMPLATES)),
      platformIdentity: { ...DEFAULT_PLATFORM_IDENTITY },

      activeTab: 'plans',
      isDirty: false,

      setActiveTab: tab => set({ activeTab: tab }),

      addPlan: data => {
        const plan = {
          id: `plan-${Date.now()}`,
          isActive: true,
          isRecommended: false,
          allowedModuleIds: [
            'member_management',
            'communication_hub',
            'dashboard_analytics',
            'automation',
            'support_help',
          ],
          tenantsCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          ...data,
        }
        set(s => ({ plans: [...s.plans, plan], isDirty: true }))
        return plan
      },

      updatePlan: (planId, updates) => {
        set(s => ({
          plans: s.plans.map(p => (p.id === planId ? { ...p, ...updates } : p)),
          isDirty: true,
        }))
      },

      deactivatePlan: planId => {
        set(s => ({
          plans: s.plans.map(p => (p.id === planId ? { ...p, isActive: false } : p)),
          isDirty: true,
        }))
      },

      reactivatePlan: planId => {
        set(s => ({
          plans: s.plans.map(p => (p.id === planId ? { ...p, isActive: true } : p)),
          isDirty: true,
        }))
      },

      clonePlan: planId => {
        const plan = get().plans.find(p => p.id === planId)
        if (!plan) return
        const clone = {
          ...plan,
          id: `plan-${Date.now()}`,
          name: `${plan.name} (Copy)`,
          slug: `${plan.slug}-copy`,
          isRecommended: false,
          tenantsCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        }
        set(s => ({ plans: [...s.plans, clone], isDirty: true }))
        return clone
      },

      toggleModuleInPlan: (planId, moduleId) => {
        set(s => ({
          plans: s.plans.map(p => {
            if (p.id !== planId) return p
            if (p.allowedModuleIds === 'all') return p
            const has = p.allowedModuleIds.includes(moduleId)
            return {
              ...p,
              allowedModuleIds: has
                ? p.allowedModuleIds.filter(m => m !== moduleId)
                : [...p.allowedModuleIds, moduleId],
            }
          }),
          isDirty: true,
        }))
      },

      setPlanAllModules: (planId, allOn) => {
        set(s => ({
          plans: s.plans.map(p => {
            if (p.id !== planId) return p
            if (allOn) {
              return { ...p, allowedModuleIds: 'all' }
            }
            return {
              ...p,
              allowedModuleIds: [
                'member_management',
                'communication_hub',
                'dashboard_analytics',
                'automation',
                'support_help',
              ],
            }
          }),
          isDirty: true,
        }))
      },

      updateModule: (moduleId, updates) => {
        set(s => ({
          modules: s.modules.map(m => (m.id === moduleId ? { ...m, ...updates } : m)),
          isDirty: true,
        }))
      },

      reorderModules: newOrder => {
        set(s => ({
          modules: newOrder.map((m, i) => ({ ...m, sortOrder: i + 1 })),
          isDirty: true,
        }))
      },

      addCommunityType: data => {
        const ct = {
          id: `ct-${Date.now()}`,
          isActive: true,
          sortOrder: get().communityTypes.length + 1,
          recommendedModuleIds: [],
          defaultHierarchyPreset: { levels: [], nodes: [] },
          tenantsUsing: 0,
          ...data,
        }
        set(s => ({ communityTypes: [...s.communityTypes, ct], isDirty: true }))
        return ct
      },

      updateCommunityType: (ctId, updates) => {
        set(s => ({
          communityTypes: s.communityTypes.map(ct => (ct.id === ctId ? { ...ct, ...updates } : ct)),
          isDirty: true,
        }))
      },

      deactivateCommunityType: ctId => {
        set(s => ({
          communityTypes: s.communityTypes.map(ct =>
            ct.id === ctId ? { ...ct, isActive: false } : ct
          ),
          isDirty: true,
        }))
      },

      reorderCommunityTypes: newOrder => {
        set(s => ({
          communityTypes: newOrder.map((ct, i) => ({ ...ct, sortOrder: i + 1 })),
          isDirty: true,
        }))
      },

      toggleModuleInCommunityType: (ctId, moduleId) => {
        set(s => ({
          communityTypes: s.communityTypes.map(ct => {
            if (ct.id !== ctId) return ct
            const has = ct.recommendedModuleIds.includes(moduleId)
            return {
              ...ct,
              recommendedModuleIds: has
                ? ct.recommendedModuleIds.filter(m => m !== moduleId)
                : [...ct.recommendedModuleIds, moduleId],
            }
          }),
          isDirty: true,
        }))
      },

      addChecklistStep: data => {
        const steps = get().checklistTemplate
        const step = {
          id: `cht-${Date.now()}`,
          stepNumber: steps.length + 1,
          isRequired: true,
          isActive: true,
          autoCompleteTrigger: null,
          owner: 'platform_admin',
          expectedDays: 1,
          ...data,
        }
        set(s => ({
          checklistTemplate: [...s.checklistTemplate, step],
          isDirty: true,
        }))
        return step
      },

      updateChecklistStep: (stepId, updates) => {
        set(s => ({
          checklistTemplate: s.checklistTemplate.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
          isDirty: true,
        }))
      },

      deleteChecklistStep: stepId => {
        set(s => ({
          checklistTemplate: s.checklistTemplate
            .filter(step => step.id !== stepId)
            .map((step, i) => ({ ...step, stepNumber: i + 1 })),
          isDirty: true,
        }))
      },

      reorderChecklistSteps: newOrder => {
        set(s => ({
          checklistTemplate: newOrder.map((step, i) => ({
            ...step,
            stepNumber: i + 1,
          })),
          isDirty: true,
        }))
      },

      toggleChecklistStepActive: stepId => {
        set(s => ({
          checklistTemplate: s.checklistTemplate.map(step =>
            step.id === stepId ? { ...step, isActive: !step.isActive } : step
          ),
          isDirty: true,
        }))
      },

      updateWhatsAppTemplate: (templateId, message) => {
        set(s => ({
          notificationTemplates: {
            ...s.notificationTemplates,
            whatsapp: {
              ...s.notificationTemplates.whatsapp,
              [templateId]: {
                ...s.notificationTemplates.whatsapp[templateId],
                message,
              },
            },
          },
          isDirty: true,
        }))
      },

      replaceWhatsAppTemplate: (templateId, tpl) => {
        set(s => ({
          notificationTemplates: {
            ...s.notificationTemplates,
            whatsapp: {
              ...s.notificationTemplates.whatsapp,
              [templateId]: tpl,
            },
          },
          isDirty: true,
        }))
      },

      updateEmailTemplate: (key, value) => {
        set(s => ({
          notificationTemplates: {
            ...s.notificationTemplates,
            email: {
              ...s.notificationTemplates.email,
              [key]: value,
            },
          },
          isDirty: true,
        }))
      },

      resetTemplate: (type, templateId) => {
        if (type === 'whatsapp') {
          const defaults = DEFAULT_NOTIFICATION_TEMPLATES.whatsapp[templateId]
          if (defaults) {
            get().replaceWhatsAppTemplate(templateId, { ...defaults })
          }
        } else {
          const def = DEFAULT_NOTIFICATION_TEMPLATES.email[templateId]
          if (def !== undefined) {
            get().updateEmailTemplate(templateId, def)
          }
        }
      },

      updatePlatformIdentity: updates => {
        set(s => ({
          platformIdentity: {
            ...s.platformIdentity,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
          isDirty: true,
        }))
      },

      getAllowedModulesForPlan: planSlug => {
        const plan = get().plans.find(p => p.slug === planSlug)
        if (!plan) return []
        if (plan.allowedModuleIds === 'all') return get().modules.map(m => m.id)
        return plan.allowedModuleIds
      },

      isModuleAllowedForPlan: (planSlug, moduleId) => {
        const key = planSlug === 'premium' ? 'professional' : planSlug
        const allowed = get().getAllowedModulesForPlan(key)
        return allowed.includes(moduleId)
      },

      getActivePlans: () => get().plans.filter(p => p.isActive),

      getActiveCommunityTypes: () =>
        [...get().communityTypes]
          .filter(ct => ct.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      getActiveChecklistSteps: () =>
        [...get().checklistTemplate]
          .filter(s => s.isActive)
          .sort((a, b) => a.stepNumber - b.stepNumber),

      markClean: () => set({ isDirty: false }),
    }),
    {
      name: 'cnp-master-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        plans: state.plans,
        modules: state.modules,
        communityTypes: state.communityTypes,
        checklistTemplate: state.checklistTemplate,
        notificationTemplates: state.notificationTemplates,
        platformIdentity: state.platformIdentity,
        activeTab: state.activeTab,
      }),
    }
  )
)

export default useMasterSettingsStore
export { DEFAULT_PLATFORM_IDENTITY }
