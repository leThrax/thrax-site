export interface CvLink {
  label: string
  url: string
}

export interface CvData {
  name: string
  title: string
  summary: string
  links: CvLink[]
  skills: string[]
}

// Placeholder content — replace every TODO with your real CV details.
// Experience/education now live in the admin-managed timeline (see
// src/components/TimelinePath.tsx / src/admin/TimelineEntryForm.tsx),
// not here.
export const cv: CvData = {
  name: 'Thrax',
  title: 'Software Engineer',
  summary: 'TODO — replace with a short professional summary.',
  links: [{ label: 'Email', url: 'mailto:thrax@thraxserver.com' }],
  skills: ['TODO', 'replace', 'with', 'real', 'skills'],
}
