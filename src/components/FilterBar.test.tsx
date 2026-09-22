import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from './FilterBar'
import type { FilterGroup, FilterTag } from '../types/filter'

const groups: FilterGroup[] = [
  { id: 'topic', label: 'Topic', order: 1 },
  { id: 'os', label: 'Operating System', order: 0 },
]

const tags: FilterTag[] = [
  { id: 'macos', label: 'MacOS', group: 'os' },
  { id: 'windows', label: 'Windows', group: 'os' },
  { id: 'privacy', label: 'Privacy', group: 'topic' },
]

describe('FilterBar', () => {
  it('renders groups in order, each with only its own tags', () => {
    render(<FilterBar groups={groups} tags={tags} selected={{}} onToggle={() => {}} />)

    const headings = screen.getAllByText(/Operating System|Topic/)
    expect(headings.map((el) => el.textContent)).toEqual(['Operating System', 'Topic'])
    expect(screen.getByRole('button', { name: 'MacOS' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Privacy' })).toBeInTheDocument()
  })

  it('marks a tag selected only when present in that group\'s selection set', () => {
    render(
      <FilterBar
        groups={groups}
        tags={tags}
        selected={{ os: new Set(['macos']) }}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: 'MacOS' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onToggle with the group and tag id of the clicked chip', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<FilterBar groups={groups} tags={tags} selected={{}} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: 'Privacy' }))

    expect(onToggle).toHaveBeenCalledWith('topic', 'privacy')
  })
})
