import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore, { roleRedirectMap } from './store/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import MemberLayout    from './layouts/MemberLayout'
import LoginPage from './pages/auth/LoginPage'
import NotFound from './pages/NotFound'

// Platform Admin
import AdminDashboard  from './pages/admin/Dashboard'
import TenantsPage     from './pages/admin/Tenants'
import TenantNew       from './pages/admin/TenantNew'
import TenantDetail    from './pages/admin/TenantDetail'
import TenantEdit      from './pages/admin/TenantEdit'
import HierarchyPage   from './pages/admin/Hierarchy'
import DomainsPage     from './pages/admin/Domains'
import BrandingPage    from './pages/admin/Branding'
import AppDeploymentPage    from './pages/admin/AppDeployment'
import AuditLogsPage        from './pages/admin/AuditLogs'
import NotificationsPage    from './pages/admin/Notifications'
import AppBuildDetailPage   from './pages/admin/AppBuildDetail'
import OnboardingPage       from './pages/admin/Onboarding'
import OnboardingDetailPage from './pages/admin/OnboardingDetail'
import UsersPage       from './pages/admin/Users'
import BillingPage     from './pages/admin/Billing'
import HealthPage      from './pages/admin/Health'
import SupportPage     from './pages/admin/Support'
import MasterSettingsPage from './pages/admin/MasterSettingsPage'
import PlatformIdentityTab from './pages/admin/settings/PlatformIdentityTab'
import SubscriptionPlansPage from './pages/admin/SubscriptionPlans'
import CommunityTypesPage from './pages/admin/CommunityTypes'
import PlanFormPage from './pages/admin/settings/PlanFormPage'
import CommunityTypeFormPage from './pages/admin/settings/CommunityTypeFormPage'
import CommunityAccessPage   from './pages/admin/CommunityAccess'
import CommunityAccessDetail from './pages/admin/CommunityAccessDetail'
import CommunityAccessForm   from './pages/admin/CommunityAccessForm'

// Community Super Admin
import CSADashboard         from './pages/csa/Dashboard'
import CSAHierarchyPage     from './pages/csa/Hierarchy'
import CSAMembersPage       from './pages/csa/Members'
import CSAModulesPage       from './pages/csa/Modules'
import CSALevelAdminsPage   from './pages/csa/LevelAdmins'
import CSAAnalyticsPage     from './pages/csa/Analytics'
import CSACommunicationPage from './pages/csa/Communication'
import CSAAutomationPage    from './pages/csa/Automation'
import CSASettingsPage      from './pages/csa/Settings'
import RolesPermissionsPage from './pages/csa/RolesPermissions'
import CSABillingPage       from './pages/csa/Billing'

// Level Admin
import LADashboard      from './pages/la/Dashboard'
import LAMembersPage    from './pages/la/Members'
import LAMeetingsPage   from './pages/la/Meetings'
import LAAttendancePage from './pages/la/Attendance'
import LAReferralsPage  from './pages/la/Referrals'
import LAEventsPage     from './pages/la/Events'
import LAVisitorsPage   from './pages/la/Visitors'
import LAReportsPage    from './pages/la/Reports'

// Member
import MemberDashboard   from './pages/member/Dashboard'
import MemberDirectory   from './pages/member/Directory'
import MemberReferrals   from './pages/member/Referrals'
import MemberMeetings    from './pages/member/Meetings'
import MemberMyStats     from './pages/member/MyStats'
import MemberProfile     from './pages/member/Profile'

function RootRedirect() {
  const { isAuthenticated, currentUser } = useAuthStore()
  if (isAuthenticated && currentUser) {
    return <Navigate to={roleRedirectMap[currentUser.role] || '/login'} replace />
  }
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Platform Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['platform_admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<AdminDashboard />} />
        <Route path="tenants"         element={<TenantsPage />} />
        <Route path="tenants/new"     element={<TenantNew />} />
        <Route path="tenants/:id"     element={<TenantDetail />} />
        <Route path="tenants/:id/edit" element={<TenantEdit />} />
        <Route path="hierarchy"  element={<HierarchyPage />} />
        <Route path="domains"    element={<DomainsPage />} />
        <Route path="branding"              element={<BrandingPage />} />
        <Route path="branding/:tenantId"    element={<BrandingPage />} />
        <Route path="app-deployment"           element={<AppDeploymentPage />} />
        <Route path="app-deployment/:buildId" element={<AppBuildDetailPage />} />
        <Route path="onboarding"                   element={<OnboardingPage />} />
        <Route path="onboarding/:onboardingId"     element={<OnboardingDetailPage />} />
        <Route path="users"      element={<UsersPage />} />
        <Route path="billing"    element={<BillingPage />} />
        <Route path="community-billing" element={<CSABillingPage />} />
        <Route path="health"     element={<HealthPage />} />
        <Route path="support"    element={<SupportPage />} />
        <Route path="settings" element={<Navigate to="/admin/settings/plans" replace />} />
        <Route path="settings/plans/new" element={<PlanFormPage />} />
        <Route path="settings/plans/:planId/edit" element={<PlanFormPage />} />
        <Route path="settings/community-types/new" element={<CommunityTypeFormPage />} />
        <Route path="settings/community-types/:ctId/edit" element={<CommunityTypeFormPage />} />
        <Route path="settings/plans"           element={<SubscriptionPlansPage />} />
        <Route path="settings/communityTypes" element={<CommunityTypesPage />} />
        <Route path="settings/identity"       element={<PlatformIdentityTab />} />
        <Route path="settings/notifications"  element={<NotificationsPage />} />
        <Route path="settings/:tab"           element={<MasterSettingsPage />} />
        <Route path="audit-logs"                  element={<AuditLogsPage />} />
        <Route path="community-access"           element={<CommunityAccessPage />} />
        <Route path="community-access/new"       element={<CommunityAccessForm />} />
        <Route path="community-access/:id/edit"  element={<CommunityAccessForm />} />
        <Route path="community-access/:id"       element={<CommunityAccessDetail />} />
      </Route>

      {/* Community Super Admin */}
      <Route path="/csa" element={
        <ProtectedRoute allowedRoles={['community_super_admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<CSADashboard />} />
        <Route path="hierarchy"     element={<CSAHierarchyPage />} />
        <Route path="modules"       element={<CSAModulesPage />} />
        <Route path="level-admins"  element={<CSALevelAdminsPage />} />
        <Route path="members"       element={<CSAMembersPage />} />
        <Route path="analytics"     element={<CSAAnalyticsPage />} />
        <Route path="communication" element={<CSACommunicationPage />} />
        <Route path="automation"    element={<CSAAutomationPage />} />
        <Route path="billing"       element={<CSABillingPage />} />
        <Route path="settings"      element={<CSASettingsPage />} />
        <Route path="roles"         element={<RolesPermissionsPage />} />
      </Route>

      {/* Level Admin */}
      <Route path="/la" element={
        <ProtectedRoute allowedRoles={['level_admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<LADashboard />} />
        <Route path="members"    element={<LAMembersPage />} />
        <Route path="meetings"   element={<LAMeetingsPage />} />
        <Route path="attendance" element={<LAAttendancePage />} />
        <Route path="referrals"  element={<LAReferralsPage />} />
        <Route path="events"     element={<LAEventsPage />} />
        <Route path="visitors"   element={<LAVisitorsPage />} />
        <Route path="reports"    element={<LAReportsPage />} />
      </Route>

      {/* Member */}
      <Route path="/member" element={
        <ProtectedRoute allowedRoles={['member']}>
          <MemberLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<MemberDashboard />} />
        <Route path="directory"  element={<MemberDirectory />} />
        <Route path="referrals"  element={<MemberReferrals />} />
        <Route path="meetings"   element={<MemberMeetings />} />
        <Route path="my-stats"   element={<MemberMyStats />} />
        <Route path="profile"    element={<MemberProfile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
