import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// vitest.config's `test.globals` stays false (this codebase's tests import
// describe/it/expect explicitly, see src/lib/filtering.test.ts), so
// Testing Library's auto-cleanup — which hooks the global `afterEach` when
// one exists — never registers itself. Do it explicitly instead, or a
// component left mounted by one test leaks into the next test's queries.
afterEach(() => {
  cleanup()
})
