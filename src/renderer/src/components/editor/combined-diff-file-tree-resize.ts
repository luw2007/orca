export const COMBINED_DIFF_FILE_TREE_DEFAULT_WIDTH = 256
export const COMBINED_DIFF_FILE_TREE_MIN_WIDTH = 200
export const COMBINED_DIFF_FILE_TREE_MAX_WIDTH = 640
export const COMBINED_DIFF_FILE_TREE_RESIZE_STEP = 16

export function clampCombinedDiffFileTreeWidth(width: number, containerWidth: number): number {
  const availableWidth = Math.max(
    COMBINED_DIFF_FILE_TREE_MIN_WIDTH,
    containerWidth - COMBINED_DIFF_FILE_TREE_MIN_WIDTH
  )
  return Math.min(
    Math.max(COMBINED_DIFF_FILE_TREE_MIN_WIDTH, width),
    COMBINED_DIFF_FILE_TREE_MAX_WIDTH,
    availableWidth
  )
}
