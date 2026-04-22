import { create } from 'zustand'
import { currentTenant } from '../data'

const useTenantStore = create((set, get) => ({
  tenant: currentTenant,

  toggleModule: (moduleKey) => {
    const { tenant } = get()
    set({
      tenant: {
        ...tenant,
        modules: {
          ...tenant.modules,
          [moduleKey]: !tenant.modules[moduleKey],
        },
      },
    })
  },

  setTenant: (tenant) => set({ tenant }),
}))

export default useTenantStore
