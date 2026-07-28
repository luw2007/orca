import type { DiffSection } from './diff-section-types'

export function shouldRequestCombinedDiffSectionLoad(
  section: Pick<DiffSection, 'diffResult' | 'error'> | undefined,
  isLoading: boolean
): boolean {
  return Boolean(section && section.diffResult === null && !section.error && !isLoading)
}
