import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useTenantChecklistStore = create(
  persist(
    (set, get) => ({
      byTenantId: {},

      setChecklist: (tenantId, steps) =>
        set(s => ({
          byTenantId: { ...s.byTenantId, [tenantId]: steps },
        })),

      getChecklist: tenantId => get().byTenantId[tenantId] || [],
    }),
    {
      name: 'cnp-tenant-checklists',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useTenantChecklistStore
