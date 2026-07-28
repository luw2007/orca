// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DictationState } from '../../../../shared/speech-types'
import { DICTATION_CONTROL_EVENT, type DictationControlAction } from './dictation-control-events'

const storeState = {
  dictationState: 'listening' as DictationState,
  partialTranscript: '',
  settings: { voice: { dictationMode: 'toggle' } } as {
    voice?: { dictationMode?: 'toggle' | 'hold' }
  } | null
}

vi.mock('@/store', () => {
  const useAppStore = (selector: (value: typeof storeState) => unknown) => selector(storeState)
  return { useAppStore }
})

vi.mock('@/i18n/i18n', () => ({
  translate: (_key: string, fallback: string) => fallback
}))

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>
}))

import { DictationIndicator } from './DictationIndicator'

function setUserAgent(userAgent: string): void {
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent })
}

const originalUserAgent = navigator.userAgent

beforeEach(() => {
  storeState.dictationState = 'listening'
  storeState.partialTranscript = ''
  storeState.settings = { voice: { dictationMode: 'toggle' } }
  setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')
})

afterEach(() => {
  cleanup()
  setUserAgent(originalUserAgent)
})

describe('DictationIndicator', () => {
  it('stops dictation when the stop button is clicked', () => {
    const actions: DictationControlAction[] = []
    const listener = (event: Event): void => {
      actions.push((event as CustomEvent<DictationControlAction>).detail)
    }
    document.addEventListener(DICTATION_CONTROL_EVENT, listener)

    render(<DictationIndicator />)
    fireEvent.click(screen.getByRole('button', { name: 'Stop dictation' }))

    document.removeEventListener(DICTATION_CONTROL_EVENT, listener)
    expect(actions).toEqual(['stop'])
  })

  it('keeps focus on the dictation target when the stop button is pressed', () => {
    render(<DictationIndicator />)
    const stopButton = screen.getByRole('button', { name: 'Stop dictation' })

    expect(fireEvent.mouseDown(stopButton)).toBe(false)
  })

  it('shows the assigned shortcut alongside the stop button in toggle mode', () => {
    render(<DictationIndicator />)

    expect(screen.getByText('⌘')).toBeTruthy()
    expect(screen.getByText('E')).toBeTruthy()
  })

  it('omits the shortcut chip in hold mode, where release stops dictation', () => {
    storeState.settings = { voice: { dictationMode: 'hold' } }
    render(<DictationIndicator />)

    expect(screen.getByRole('button', { name: 'Stop dictation' })).toBeTruthy()
    expect(screen.queryByText('⌘')).toBeNull()
  })

  it('hides the stop control once the session is already stopping', () => {
    storeState.dictationState = 'stopping'
    render(<DictationIndicator />)

    expect(screen.getByText('Processing...')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Stop dictation' })).toBeNull()
  })

  it('renders nothing while idle', () => {
    storeState.dictationState = 'idle'
    const { container } = render(<DictationIndicator />)

    expect(container.firstChild).toBeNull()
  })
})
