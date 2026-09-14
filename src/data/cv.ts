export interface CvExperience {
  role: string
  org: string
  period: string
  bullets: string[]
}

export interface CvEducation {
  degree: string
  org: string
  period: string
}

export interface CvLink {
  label: string
  url: string
}

export interface CvData {
  name: string
  title: string
  summary: string
  links: CvLink[]
  experience: CvExperience[]
  education: CvEducation[]
  skills: string[]
}

// Placeholder content — replace every TODO with your real CV details.
export const cv: CvData = {
  name: 'Thrax',
  title: 'Software Engineer',
  summary: 'TODO — replace with a short professional summary.',
  links: [{ label: 'Email', url: 'mailto:thrax@thraxserver.com' }],
  experience: [
    {
      role: 'TODO — job title',
      org: 'TODO — company',
      period: 'TODO — dates',
      bullets: ['TODO — replace with real experience bullets'],
    },
  ],
  education: [{ degree: 'TODO — degree', org: 'TODO — school', period: 'TODO — dates' }],
  skills: ['TODO', 'replace', 'with', 'real', 'skills'],
}
