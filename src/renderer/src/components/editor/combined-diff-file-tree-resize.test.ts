import { describe, expect, it } from 'vitest'
import {
  clampCombinedDiffFileTreeWidth,
  COMBINED_DIFF_FILE_TREE_MAX_WIDTH,
  COMBINED_DIFF_FILE_TREE_MIN_WIDTH
} from './combined-diff-file-tree-resize'

describe('combined diff file tree resize', () => {
  it('keeps both panes usable in a narrow container', () => {
    expect(clampCombinedDiffFileTreeWidth(600, 500)).toBe(300)
  })

  it('applies the tree width bounds', () => {
    expect(clampCombinedDiffFileTreeWidth(100, 1_000)).toBe(COMBINED_DIFF_FILE_TREE_MIN_WIDTH)
    expect(clampCombinedDiffFileTreeWidth(1_000, 1_000)).toBe(COMBINED_DIFF_FILE_TREE_MAX_WIDTH)
  })
})
