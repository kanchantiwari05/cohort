import CommunityTypesTab from './settings/CommunityTypesTab'

export default function CommunityTypesPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] md:min-h-0 md:h-[calc(100vh-4rem)]">
      <div className="bg-white border-b border-[#D0DCF0] px-5 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[17px] font-bold text-[#1A237E] leading-tight">
              Community Types
            </h1>
            <p className="text-[12px] text-[#90A4AE] mt-0.5">
              Type master list with hierarchy presets and recommended modules
            </p>
          </div>
          <span className="text-[11px] text-[#B0BEC5] hidden sm:inline">
            Auto-saves on change
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#F4F8FF] min-w-0">
        <CommunityTypesTab />
      </div>
    </div>
  )
}
