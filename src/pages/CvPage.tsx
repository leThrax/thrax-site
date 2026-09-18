import { motion } from 'motion/react'
import { cv } from '../data/cv'
import { sectionVariants } from '../lib/motionVariants'
import { TimelinePath } from '../components/TimelinePath'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function SectionHeading({ label }: { label: string }) {
  return (
    <h2 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
      <span className="text-accent">❯</span> {label}
    </h2>
  )
}

export function CvPage() {
  useDocumentTitle('thrax-site — CV')

  return (
    <>
      <motion.div variants={sectionVariants} className="flex flex-col gap-1">
        <h1 className="font-mono text-2xl font-medium text-fg">{cv.name}</h1>
        <p className="font-mono text-sm text-accent">{cv.title}</p>
        <p className="text-sm text-muted">{cv.summary}</p>
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-xs">
          {cv.links.map((link) => (
            <a key={link.url} href={link.url} className="text-accent hover:underline">
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>

      <TimelinePath />

      <motion.div variants={sectionVariants} className="flex flex-col gap-3">
        <SectionHeading label="Skills" />
        <div className="flex flex-wrap gap-1.5">
          {cv.skills.map((skill) => (
            <span
              key={skill}
              className="rounded border border-border px-2 py-0.5 font-mono text-xs text-muted"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
    </>
  )
}
