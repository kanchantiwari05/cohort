// ─────────────────────────────────────────────────────────────────────────────
// CNP — Sample Communities (3 different hierarchy types)
// ─────────────────────────────────────────────────────────────────────────────

export const communities = [

  // ── COMMUNITY 1: BNI Mumbai Metro ────────────────────────────────────────
  // 3-level: Zone → Chapter → Group
  {
    id: 'comm-001',
    name: 'BNI Mumbai Metro',
    type: 'professional_networking',
    domain: 'bnimumbai.cnp.app',
    csaId: 'u-csa-001',
    csaName: 'Rajesh Mehta',
    memberCount: 240,
    status: 'active',
    createdAt: '2024-02-15',
    activeModules: ['meetings', 'attendance', 'referrals', 'one_to_one', 'communication'],
    config: {
      maxDepth: 3,
      levels: [
        { id: 'l1-c1', index: 0, name: 'Zone',    namePlural: 'Zones',
          color: '#1B3A6B', icon: 'map-pin',    canHaveLA: true, isOperational: false },
        { id: 'l2-c1', index: 1, name: 'Chapter', namePlural: 'Chapters',
          color: '#028090', icon: 'users',      canHaveLA: true, isOperational: true },
        { id: 'l3-c1', index: 2, name: 'Group',   namePlural: 'Groups',
          color: '#C17900', icon: 'user-check', canHaveLA: true, isOperational: true },
      ],
    },
    nodes: [
      // ── Zones (root nodes) ──
      { id: 'n1',  communityId: 'comm-001', levelId: 'l1-c1', levelIndex: 0, levelName: 'Zone',
        parentId: null, name: 'North Zone', code: 'NZ',
        laId: 'la-001', laName: 'Priya Sharma', laEmail: 'priya@bni.com', laPhone: '9867001001', laSince: '2024-02-20',
        memberCount: 94, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2024-02-15' },
      { id: 'n2',  communityId: 'comm-001', levelId: 'l1-c1', levelIndex: 0, levelName: 'Zone',
        parentId: null, name: 'South Zone', code: 'SZ',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 146, directMemberCount: 0, childNodeCount: 4, active: true, createdAt: '2024-02-15' },

      // ── Chapters under North Zone ──
      { id: 'n3',  communityId: 'comm-001', levelId: 'l2-c1', levelIndex: 1, levelName: 'Chapter',
        parentId: 'n1', name: 'Andheri Chapter', code: 'AND',
        laId: 'la-002', laName: 'Vikram Nair', laEmail: 'vikram@bni.com', laPhone: '9867002002', laSince: '2024-02-20',
        memberCount: 47, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2024-02-15' },
      { id: 'n4',  communityId: 'comm-001', levelId: 'l2-c1', levelIndex: 1, levelName: 'Chapter',
        parentId: 'n1', name: 'Borivali Chapter', code: 'BOR',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 31, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2024-02-15' },

      // ── Chapters under South Zone ──
      { id: 'n5',  communityId: 'comm-001', levelId: 'l2-c1', levelIndex: 1, levelName: 'Chapter',
        parentId: 'n2', name: 'Bandra Chapter', code: 'BAN',
        laId: 'la-003', laName: 'Meera Iyer', laEmail: 'meera@bni.com', laPhone: '9867003003', laSince: '2024-03-01',
        memberCount: 52, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2024-02-15' },
      { id: 'n6',  communityId: 'comm-001', levelId: 'l2-c1', levelIndex: 1, levelName: 'Chapter',
        parentId: 'n2', name: 'Worli Chapter', code: 'WOR',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 38, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2024-02-15' },
      { id: 'n12', communityId: 'comm-001', levelId: 'l2-c1', levelIndex: 1, levelName: 'Chapter',
        parentId: 'n2', name: 'Dadar Chapter', code: 'DAD',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 28, directMemberCount: 0, childNodeCount: 1, active: true, createdAt: '2024-03-01' },
      { id: 'n13', communityId: 'comm-001', levelId: 'l2-c1', levelIndex: 1, levelName: 'Chapter',
        parentId: 'n2', name: 'Colaba Chapter', code: 'COL',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 28, directMemberCount: 0, childNodeCount: 1, active: true, createdAt: '2024-03-01' },

      // ── Groups under Andheri Chapter ──
      { id: 'n7',  communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n3', name: 'Andheri Morning Group', code: 'AMG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 24, directMemberCount: 24, childNodeCount: 0, active: true, createdAt: '2024-02-15' },
      { id: 'n8',  communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n3', name: 'Andheri Evening Group', code: 'AEG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 23, directMemberCount: 23, childNodeCount: 0, active: true, createdAt: '2024-02-15' },

      // ── Groups under Borivali Chapter ──
      { id: 'n9',  communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n4', name: 'Borivali Business Group', code: 'BBG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 18, directMemberCount: 18, childNodeCount: 0, active: true, createdAt: '2024-02-15' },
      { id: 'n10', communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n4', name: 'Borivali Pro Group', code: 'BPG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 13, directMemberCount: 13, childNodeCount: 0, active: true, createdAt: '2024-02-15' },

      // ── Groups under Bandra Chapter ──
      { id: 'n14', communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n5', name: 'Bandra A Group', code: 'BAG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 27, directMemberCount: 27, childNodeCount: 0, active: true, createdAt: '2024-03-01' },
      { id: 'n15', communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n5', name: 'Bandra B Group', code: 'BBG2',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 25, directMemberCount: 25, childNodeCount: 0, active: true, createdAt: '2024-03-01' },

      // ── Groups under Worli Chapter ──
      { id: 'n16', communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n6', name: 'Worli Morning Group', code: 'WMG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 20, directMemberCount: 20, childNodeCount: 0, active: true, createdAt: '2024-03-01' },
      { id: 'n17', communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n6', name: 'Worli Evening Group', code: 'WEG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 18, directMemberCount: 18, childNodeCount: 0, active: true, createdAt: '2024-03-01' },

      // ── Groups under Dadar & Colaba ──
      { id: 'n18', communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n12', name: 'Dadar Main Group', code: 'DMG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 28, directMemberCount: 28, childNodeCount: 0, active: true, createdAt: '2024-03-01' },
      { id: 'n19', communityId: 'comm-001', levelId: 'l3-c1', levelIndex: 2, levelName: 'Group',
        parentId: 'n13', name: 'Colaba Main Group', code: 'CMG',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 28, directMemberCount: 28, childNodeCount: 0, active: true, createdAt: '2024-03-01' },
    ],

    // Members for this community
    members: [
      { id: 'mem-001', communityId: 'comm-001', nodeId: 'n7', name: 'Amit Desai',     phone: '9812345678', email: 'amit@desaitech.com',   businessName: 'Desai Technologies', category: 'IT Services',    status: 'active', engagementScore: 87, memberId: 'BNI-AND-001', memberSince: '2024-03-01' },
      { id: 'mem-002', communityId: 'comm-001', nodeId: 'n7', name: 'Sneha Kapoor',   phone: '9812345679', email: 'sneha@kapoorlaw.com',    businessName: 'Kapoor & Associates', category: 'Legal',         status: 'active', engagementScore: 72, memberId: 'BNI-AND-002', memberSince: '2024-03-05' },
      { id: 'mem-003', communityId: 'comm-001', nodeId: 'n8', name: 'Rahul Shah',     phone: '9812345680', email: 'rahul@shahfinance.com',  businessName: 'Shah Finance',        category: 'Finance',       status: 'active', engagementScore: 91, memberId: 'BNI-AND-003', memberSince: '2024-03-10' },
      { id: 'mem-004', communityId: 'comm-001', nodeId: 'n9', name: 'Pooja Mehta',    phone: '9812345681', email: 'pooja@mehtaarch.com',    businessName: 'Mehta Architects',    category: 'Architecture',  status: 'active', engagementScore: 65, memberId: 'BNI-BOR-001', memberSince: '2024-03-15' },
      { id: 'mem-005', communityId: 'comm-001', nodeId: 'n10', name: 'Kiran Joshi',   phone: '9812345682', email: 'kiran@joshihr.com',      businessName: 'Joshi HR Solutions',  category: 'HR',            status: 'active', engagementScore: 78, memberId: 'BNI-BOR-002', memberSince: '2024-04-01' },
      { id: 'mem-006', communityId: 'comm-001', nodeId: 'n14', name: 'Deepak Verma',  phone: '9812345683', email: 'deepak@vermadigital.com', businessName: 'Verma Digital',      category: 'Marketing',     status: 'active', engagementScore: 82, memberId: 'BNI-BAN-001', memberSince: '2024-04-05' },
      { id: 'mem-007', communityId: 'comm-001', nodeId: 'n15', name: 'Anita Singh',   phone: '9812345684', email: 'anita@singhrealty.com',  businessName: 'Singh Realty',        category: 'Real Estate',   status: 'active', engagementScore: 69, memberId: 'BNI-BAN-002', memberSince: '2024-04-10' },
      { id: 'mem-008', communityId: 'comm-001', nodeId: 'n16', name: 'Suresh Kumar',  phone: '9812345685', email: 'suresh@kumartravel.com', businessName: 'Kumar Travels',       category: 'Travel',        status: 'at_risk', engagementScore: 42, memberId: 'BNI-WOR-001', memberSince: '2024-04-15' },
      { id: 'mem-009', communityId: 'comm-001', nodeId: 'n3',  name: 'Priya Sharma',  phone: '9867001001', email: 'priya@bni.com',          businessName: 'Sharma Consulting',   category: 'Consulting',    status: 'active', engagementScore: 95, memberId: 'BNI-LA-001', memberSince: '2024-02-20' },
      { id: 'mem-010', communityId: 'comm-001', nodeId: 'n3',  name: 'Vikram Nair',   phone: '9867002002', email: 'vikram@bni.com',          businessName: 'Nair Imports',         category: 'Trading',      status: 'active', engagementScore: 88, memberId: 'BNI-LA-002', memberSince: '2024-02-20' },
    ],
  },

  // ── COMMUNITY 2: Akhil Bharat Hindu Parishad ─────────────────────────────
  // 4-level: Country → State → City → Temple Shakha
  {
    id: 'comm-002',
    name: 'Akhil Bharat Hindu Parishad',
    type: 'religious',
    domain: 'abhp.cnp.app',
    csaId: 'u-csa-002',
    csaName: 'Dharampal Sharma',
    memberCount: 4200,
    status: 'active',
    createdAt: '2023-06-01',
    activeModules: ['meetings', 'attendance', 'events', 'activity_feed', 'communication'],
    config: {
      maxDepth: 4,
      levels: [
        { id: 'l1-c2', index: 0, name: 'Country',       namePlural: 'Countries',
          color: '#1B3A6B', icon: 'globe',    canHaveLA: true, isOperational: false },
        { id: 'l2-c2', index: 1, name: 'State',         namePlural: 'States',
          color: '#6A1B9A', icon: 'map',      canHaveLA: true, isOperational: false },
        { id: 'l3-c2', index: 2, name: 'City',          namePlural: 'Cities',
          color: '#028090', icon: 'map-pin',  canHaveLA: true, isOperational: false },
        { id: 'l4-c2', index: 3, name: 'Temple Shakha', namePlural: 'Temple Shakhas',
          color: '#C17900', icon: 'home',     canHaveLA: true, isOperational: true },
      ],
    },
    nodes: [
      // Country
      { id: 'hn1',  communityId: 'comm-002', levelId: 'l1-c2', levelIndex: 0, levelName: 'Country',
        parentId: null, name: 'India', code: 'IN',
        laId: 'u-csa-002', laName: 'Dharampal Sharma', laEmail: 'dharampal@abhp.org', laPhone: '9711001001', laSince: '2023-06-01',
        memberCount: 4200, directMemberCount: 0, childNodeCount: 3, active: true, createdAt: '2023-06-01' },
      // States
      { id: 'hn2',  communityId: 'comm-002', levelId: 'l2-c2', levelIndex: 1, levelName: 'State',
        parentId: 'hn1', name: 'Maharashtra', code: 'MH',
        laId: 'la-h1', laName: 'Ramesh Joshi', laEmail: 'ramesh@abhp.org', laPhone: '9711002001', laSince: '2023-06-15',
        memberCount: 1200, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2023-06-01' },
      { id: 'hn3',  communityId: 'comm-002', levelId: 'l2-c2', levelIndex: 1, levelName: 'State',
        parentId: 'hn1', name: 'Gujarat', code: 'GJ',
        laId: 'la-h2', laName: 'Haresh Patel', laEmail: 'haresh@abhp.org', laPhone: '9711003001', laSince: '2023-06-15',
        memberCount: 980, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2023-06-01' },
      { id: 'hn4',  communityId: 'comm-002', levelId: 'l2-c2', levelIndex: 1, levelName: 'State',
        parentId: 'hn1', name: 'Rajasthan', code: 'RJ',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 780, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2023-06-01' },
      // Cities under Maharashtra
      { id: 'hn5',  communityId: 'comm-002', levelId: 'l3-c2', levelIndex: 2, levelName: 'City',
        parentId: 'hn2', name: 'Mumbai', code: 'MUM',
        laId: 'la-h3', laName: 'Suresh Kulkarni', laEmail: 'suresh.k@abhp.org', laPhone: '9711004001', laSince: '2023-07-01',
        memberCount: 520, directMemberCount: 0, childNodeCount: 3, active: true, createdAt: '2023-06-01' },
      { id: 'hn6',  communityId: 'comm-002', levelId: 'l3-c2', levelIndex: 2, levelName: 'City',
        parentId: 'hn2', name: 'Pune', code: 'PUN',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 380, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2023-06-01' },
      // Temple Shakhas under Mumbai
      { id: 'hn7',  communityId: 'comm-002', levelId: 'l4-c2', levelIndex: 3, levelName: 'Temple Shakha',
        parentId: 'hn5', name: 'Dadar Shakha', code: 'DAD-SH',
        laId: 'la-h4', laName: 'Vinod Sharma', laEmail: 'vinod@abhp.org', laPhone: '9711005001', laSince: '2023-07-10',
        memberCount: 145, directMemberCount: 145, childNodeCount: 0, active: true, createdAt: '2023-07-01' },
      { id: 'hn8',  communityId: 'comm-002', levelId: 'l4-c2', levelIndex: 3, levelName: 'Temple Shakha',
        parentId: 'hn5', name: 'Andheri Shakha', code: 'AND-SH',
        laId: 'la-h5', laName: 'Prakash Desai', laEmail: 'prakash@abhp.org', laPhone: '9711006001', laSince: '2023-07-10',
        memberCount: 180, directMemberCount: 180, childNodeCount: 0, active: true, createdAt: '2023-07-01' },
      { id: 'hn9',  communityId: 'comm-002', levelId: 'l4-c2', levelIndex: 3, levelName: 'Temple Shakha',
        parentId: 'hn5', name: 'Borivali Shakha', code: 'BOR-SH',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 195, directMemberCount: 195, childNodeCount: 0, active: true, createdAt: '2023-07-01' },
      // Cities under Gujarat
      { id: 'hn10', communityId: 'comm-002', levelId: 'l3-c2', levelIndex: 2, levelName: 'City',
        parentId: 'hn3', name: 'Ahmedabad', code: 'AMD',
        laId: 'la-h6', laName: 'Kiran Shah', laEmail: 'kiran@abhp.org', laPhone: '9711007001', laSince: '2023-07-15',
        memberCount: 420, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2023-06-01' },
      { id: 'hn11', communityId: 'comm-002', levelId: 'l3-c2', levelIndex: 2, levelName: 'City',
        parentId: 'hn3', name: 'Surat', code: 'SUR',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 320, directMemberCount: 0, childNodeCount: 2, active: true, createdAt: '2023-06-01' },
      // Shakhas under Ahmedabad
      { id: 'hn12', communityId: 'comm-002', levelId: 'l4-c2', levelIndex: 3, levelName: 'Temple Shakha',
        parentId: 'hn10', name: 'Maninagar Shakha', code: 'MAN-SH',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 210, directMemberCount: 210, childNodeCount: 0, active: true, createdAt: '2023-07-15' },
      { id: 'hn13', communityId: 'comm-002', levelId: 'l4-c2', levelIndex: 3, levelName: 'Temple Shakha',
        parentId: 'hn10', name: 'Navrangpura Shakha', code: 'NAV-SH',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 210, directMemberCount: 210, childNodeCount: 0, active: true, createdAt: '2023-07-15' },
      // Cities under Rajasthan
      { id: 'hn14', communityId: 'comm-002', levelId: 'l3-c2', levelIndex: 2, levelName: 'City',
        parentId: 'hn4', name: 'Jaipur', code: 'JAI',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 400, directMemberCount: 0, childNodeCount: 0, active: true, createdAt: '2023-08-01' },
      { id: 'hn15', communityId: 'comm-002', levelId: 'l3-c2', levelIndex: 2, levelName: 'City',
        parentId: 'hn4', name: 'Udaipur', code: 'UDA',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 380, directMemberCount: 0, childNodeCount: 0, active: true, createdAt: '2023-08-01' },
      // Temple Shakhas under Pune
      { id: 'hn16', communityId: 'comm-002', levelId: 'l4-c2', levelIndex: 3, levelName: 'Temple Shakha',
        parentId: 'hn6', name: 'Shivajinagar Shakha', code: 'SHV-SH',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 190, directMemberCount: 190, childNodeCount: 0, active: true, createdAt: '2023-07-15' },
      { id: 'hn17', communityId: 'comm-002', levelId: 'l4-c2', levelIndex: 3, levelName: 'Temple Shakha',
        parentId: 'hn6', name: 'Kothrud Shakha', code: 'KOT-SH',
        laId: null, laName: null, laEmail: null, laPhone: null, laSince: null,
        memberCount: 190, directMemberCount: 190, childNodeCount: 0, active: true, createdAt: '2023-07-15' },
    ],
    members: [
      { id: 'hmem-001', communityId: 'comm-002', nodeId: 'hn7',  name: 'Vinod Sharma',    phone: '9711005001', email: 'vinod@abhp.org',    businessName: 'Sharma Textiles', category: 'Textiles',   status: 'active', engagementScore: 90, memberId: 'ABHP-MUM-001', memberSince: '2023-07-10' },
      { id: 'hmem-002', communityId: 'comm-002', nodeId: 'hn7',  name: 'Geeta Rao',       phone: '9711005002', email: 'geeta@raoarts.com', businessName: 'Rao Arts',        category: 'Arts',       status: 'active', engagementScore: 78, memberId: 'ABHP-MUM-002', memberSince: '2023-07-15' },
      { id: 'hmem-003', communityId: 'comm-002', nodeId: 'hn8',  name: 'Prakash Desai',   phone: '9711006001', email: 'prakash@abhp.org',  businessName: 'Desai Jewellers', category: 'Jewellery',  status: 'active', engagementScore: 85, memberId: 'ABHP-MUM-003', memberSince: '2023-07-10' },
      { id: 'hmem-004', communityId: 'comm-002', nodeId: 'hn9',  name: 'Sunita Verma',    phone: '9711006002', email: 'sunita@verma.com',  businessName: 'Verma Sarees',    category: 'Textiles',   status: 'at_risk', engagementScore: 38, memberId: 'ABHP-MUM-004', memberSince: '2023-08-01' },
    ],
  },

  // ── COMMUNITY 3: Mumbai Founders Club ────────────────────────────────────
  // 1-level flat: All members directly under Community
  {
    id: 'comm-003',
    name: 'Mumbai Founders Club',
    type: 'flat',
    domain: 'mfc.cnp.app',
    csaId: 'u-csa-003',
    csaName: 'Rohan Mehta',
    memberCount: 85,
    status: 'active',
    createdAt: '2024-01-10',
    activeModules: ['meetings', 'attendance', 'referrals', 'activity_feed', 'communication'],
    config: {
      maxDepth: 1,
      levels: [
        { id: 'l1-c3', index: 0, name: 'Club', namePlural: 'Clubs',
          color: '#1B3A6B', icon: 'users', canHaveLA: true, isOperational: true },
      ],
    },
    nodes: [
      { id: 'fn1', communityId: 'comm-003', levelId: 'l1-c3', levelIndex: 0, levelName: 'Club',
        parentId: null, name: 'Mumbai Founders Club', code: 'MFC',
        laId: 'u-csa-003', laName: 'Rohan Mehta', laEmail: 'rohan@mfc.in', laPhone: '9922001001', laSince: '2024-01-10',
        memberCount: 85, directMemberCount: 85, childNodeCount: 0, active: true, createdAt: '2024-01-10' },
    ],
    members: [
      { id: 'fmem-001', communityId: 'comm-003', nodeId: 'fn1', name: 'Arjun Malhotra', phone: '9922001002', email: 'arjun@startupx.in', businessName: 'StartupX', category: 'Technology', status: 'active', engagementScore: 93, memberId: 'MFC-001', memberSince: '2024-01-15' },
      { id: 'fmem-002', communityId: 'comm-003', nodeId: 'fn1', name: 'Nisha Reddy',    phone: '9922001003', email: 'nisha@nreddy.co',   businessName: 'NR Ventures', category: 'VC',        status: 'active', engagementScore: 88, memberId: 'MFC-002', memberSince: '2024-01-20' },
      { id: 'fmem-003', communityId: 'comm-003', nodeId: 'fn1', name: 'Siddharth Rao', phone: '9922001004', email: 'sid@sidrao.com',    businessName: 'Rao Design', category: 'Design',    status: 'active', engagementScore: 74, memberId: 'MFC-003', memberSince: '2024-02-01' },
    ],
  },
];

// Quick lookup by id
export const getCommunityById = (id) => communities.find(c => c.id === id);
