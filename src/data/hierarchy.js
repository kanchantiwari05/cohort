export const zones = [
  { id: 'z1', name: 'Zone Alpha', adminId: 'la005', memberCount: 120, chapterCount: 4, active: true },
  { id: 'z2', name: 'Zone Beta',  adminId: 'la006', memberCount: 120, chapterCount: 4, active: true },
]

export const chapters = [
  { id: 'c1', zoneId: 'z1', name: 'Andheri Chapter',     adminId: 'la001', memberCount: 32, groupCount: 4, active: true },
  { id: 'c2', zoneId: 'z1', name: 'Bandra Chapter',      adminId: 'la002', memberCount: 28, groupCount: 4, active: true },
  { id: 'c3', zoneId: 'z1', name: 'Borivali Chapter',    adminId: null,    memberCount: 30, groupCount: 4, active: true },
  { id: 'c4', zoneId: 'z1', name: 'Dadar Chapter',       adminId: null,    memberCount: 30, groupCount: 4, active: true },
  { id: 'c5', zoneId: 'z2', name: 'Powai Chapter',       adminId: 'la003', memberCount: 31, groupCount: 4, active: true },
  { id: 'c6', zoneId: 'z2', name: 'Thane Chapter',       adminId: 'la004', memberCount: 29, groupCount: 4, active: true },
  { id: 'c7', zoneId: 'z2', name: 'Navi Mumbai Chapter', adminId: null,    memberCount: 30, groupCount: 4, active: true },
  { id: 'c8', zoneId: 'z2', name: 'Vashi Chapter',       adminId: null,    memberCount: 30, groupCount: 4, active: true },
]

export const groups = Array.from({ length: 24 }, (_, i) => {
  const chapterId = `c${Math.floor(i / 3) + 1}`
  return {
    id: `g${i + 1}`,
    chapterId,
    zoneId: i < 12 ? 'z1' : 'z2',
    name: `Group ${i + 1}`,
    memberCount: 10,
    active: true,
  }
})
