/** Replace {{vars}} in templates for live preview */
export const SAMPLE_VALUES = {
  platformName: 'Community Networking Platform',
  communityName: 'BNI Mumbai Metro',
  name: 'Rajesh Mehta',
  otp: '482719',
  expiry: '10',
  appLink: 'https://cnp.app/download',
  iosLink: 'https://apps.apple.com/app/cnp',
  androidLink: 'https://play.google.com/store/apps/cnp',
  portalLink: 'https://portal.cnp.app',
  amount: '25,000',
  period: 'Apr 2026',
  dueDate: '30 Apr 2026',
  invoiceNumber: 'INV-2048',
  stepName: 'Branding Assets Uploaded',
  referralCount: '12',
  meetingCount: '8',
}

export function fillTemplate(str) {
  if (!str) return ''
  let out = str
  Object.entries(SAMPLE_VALUES).forEach(([k, v]) => {
    out = out.split(`{{${k}}}`).join(v)
  })
  return out
}
