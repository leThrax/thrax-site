import { motion } from 'motion/react'
import { cv } from '../data/cv'
import { sectionVariants } from '../lib/motionVariants'

function SectionHeading({ label }: { label: string }) {
  return (
    <h2 className="font-mono text-xs font-semibold tracking-wide text-muted uppercase">
      <span className="text-accent">❯</span> {label}
    </h2>
  )
}

export function CvPage() {
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

      <motion.div variants={sectionVariants} className="flex flex-col gap-3">
        <SectionHeading label="Experience" />
        <div className="flex flex-col gap-3">
          {cv.experience.map((entry) => (
            <div key={`${entry.org}-${entry.role}`} className="rounded-md border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-mono text-sm font-medium text-fg">
                  {entry.role} <span className="text-muted">@ {entry.org}</span>
                </p>
                <p className="font-mono text-xs text-muted">{entry.period}</p>
              </div>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted">
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={sectionVariants} className="flex flex-col gap-3">
        <SectionHeading label="Education" />
        <div className="flex flex-col gap-3">
          {cv.education.map((entry) => (
            <div key={`${entry.org}-${entry.degree}`} className="rounded-md border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-mono text-sm font-medium text-fg">
                  {entry.degree} <span className="text-muted">@ {entry.org}</span>
                </p>
                <p className="font-mono text-xs text-muted">{entry.period}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

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
