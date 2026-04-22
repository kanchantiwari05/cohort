/** Routes & labels for Master Settings — used by DashboardLayout + MasterSettingsPage */
export const MASTER_SETTINGS_TAB_IDS = [
  'plans',
  'modules',
  'communityTypes',
]

export function isMasterSettingsTab(tab) {
  return MASTER_SETTINGS_TAB_IDS.includes(tab)
}
