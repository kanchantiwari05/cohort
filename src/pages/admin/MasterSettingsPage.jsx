import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LayoutGrid, CreditCard, Tag } from 'lucide-react'
import useMasterSettingsStore from '../../store/masterSettingsStore'
import { isMasterSettingsTab } from '../../config/masterSettingsNav'
import PlansTab from './settings/PlansTab'
import ModuleCatalogueTab from './settings/ModuleCatalogueTab'
import CommunityTypesTab from './settings/CommunityTypesTab'

const TABS = [
  { id: 'plans',          label: 'Plans',           icon: CreditCard },
  { id: 'modules',        label: 'Modules',         icon: LayoutGrid },
  { id: 'communityTypes', label: 'Community Types', icon: Tag },
]

export default function MasterSettingsPage() {
  const { tab } = useParams()
  const navigate = useNavigate()
  const setActiveTab = useMasterSettingsStore(s => s.setActiveTab)
  const isDirty = useMasterSettingsStore(s => s.isDirty)
  const markClean = useMasterSettingsStore(s => s.markClean)

  const activeTab = isMasterSettingsTab(tab) ? tab : 'plans'

  useEffect(() => {
    if (tab && !isMasterSettingsTab(tab)) {
      navigate('/admin/settings/plans', { replace: true })
      return
    }
    setActiveTab(activeTab)
  }, [tab, activeTab, navigate, setActiveTab])

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] md:min-h-0 md:h-[calc(100vh-4rem)]">
      {/* Page header + tab bar — always visible */}
      {true && (
        <div className="bg-white border-b border-[#D0DCF0] px-5 pt-4 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-[17px] font-bold text-[#1A237E] leading-tight">
                Master Settings
              </h1>
              <p className="text-[12px] text-[#90A4AE] mt-0.5">
                Configure once · Drives everything on the platform
              </p>
            </div>
            <span className="text-[11px] text-[#B0BEC5] hidden sm:inline">
              Auto-saves on change
            </span>
          </div>

          {/* In-page tab bar */}
          <nav className="flex items-end gap-0.5 -mb-px overflow-x-auto scrollbar-none">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(`/admin/settings/${id}`)}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] font-medium whitespace-nowrap
                    border-b-2 transition-colors
                    ${active
                      ? 'border-[#028090] text-[#028090] bg-white'
                      : 'border-transparent text-[#546E7A] hover:text-[#1B3A6B] hover:border-[#D0DCF0]'
                    }
                  `}
                >
                  <Icon size={13} />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Unsaved banner */}
      {isDirty && (
        <div className="bg-[#FFF8E1] border-b border-[#F0C040] px-5 py-1.5 flex items-center justify-between flex-shrink-0">
          <span className="text-[12px] text-[#C17900] font-medium">⚠ Unsaved changes</span>
          <button type="button" onClick={markClean} className="text-[11px] text-[#C17900] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab content */}
      <div className={`flex-1 overflow-y-auto bg-[#F4F8FF] min-w-0 ${activeTab === 'modules' ? 'p-5' : ''}`}>
        {activeTab === 'plans'          && <PlansTab />}
        {activeTab === 'modules'        && <ModuleCatalogueTab />}
        {activeTab === 'communityTypes' && <CommunityTypesTab />}
      </div>
    </div>
  )
}
