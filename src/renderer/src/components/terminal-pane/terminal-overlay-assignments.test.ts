import { describe, expect, it } from 'vitest'
import { hasActiveTerminal } from './terminal-overlay-assignments'

describe('terminal overlay assignments', () => {
  const assignments = new Map([
    ['terminal-a', { groupId: 'group-a', isActiveInGroup: false }],
    ['terminal-b', { groupId: 'group-a', isActiveInGroup: true }]
  ])

  it('keeps a presented terminal visible while its group activates another terminal', () => {
    expect(hasActiveTerminal(assignments, 'group-a')).toBe(true)
  })

  it('hides a retained terminal when its group has no active terminal', () => {
    expect(hasActiveTerminal(assignments, 'group-b')).toBe(false)
  })
})
