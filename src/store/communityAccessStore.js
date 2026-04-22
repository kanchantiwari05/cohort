import { create } from 'zustand'
import { COMMUNITIES } from '../data/rbac'

let seq = COMMUNITIES.length

const useCommunityAccessStore = create((set, get) => ({
  communities: COMMUNITIES.map(c => ({ ...c })),

  addCommunity: data => {
    const id = `comm-${String(++seq).padStart(3, '0')}`
    set(s => ({ communities: [...s.communities, { ...data, id, memberCount: 0, adminCount: 0, storageUsed: 0 }] }))
    return id
  },

  updateCommunity: (id, data) =>
    set(s => ({ communities: s.communities.map(c => c.id === id ? { ...c, ...data } : c) })),

  removeCommunity: id =>
    set(s => ({ communities: s.communities.filter(c => c.id !== id) })),

  getCommunity: id => get().communities.find(c => c.id === id),
}))

export default useCommunityAccessStore
