// Shared stagger/fade-in variants for page-load entrance animation. Defined
// once here (rather than per-page) so SiteLayout's outer container and every
// page's own section wrappers participate in the same stagger sequence —
// Framer Motion propagates variants through context, not DOM parentage, so
// this works even though pages render inside <Outlet/> rather than as direct
// children of the animating container.
export const containerVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.15, staggerChildren: 0.12 } },
}

export const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}
