import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import {
  clampCombinedDiffFileTreeWidth,
  COMBINED_DIFF_FILE_TREE_DEFAULT_WIDTH,
  COMBINED_DIFF_FILE_TREE_RESIZE_STEP
} from './combined-diff-file-tree-resize'

let combinedDiffFileTreeWidthPreference = COMBINED_DIFF_FILE_TREE_DEFAULT_WIDTH

export function useCombinedDiffFileTreeResize(collapsed: boolean): {
  handleResizeKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
  handleResizePointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  treeRef: React.RefObject<HTMLElement | null>
  width: number
} {
  const treeRef = useRef<HTMLElement>(null)
  const activeResizeCleanupRef = useRef<(() => void) | null>(null)
  const [width, setWidthState] = useState(combinedDiffFileTreeWidthPreference)
  const setWidth = useCallback((nextWidth: number, containerWidth: number): void => {
    const clampedWidth = clampCombinedDiffFileTreeWidth(nextWidth, containerWidth)
    combinedDiffFileTreeWidthPreference = clampedWidth
    setWidthState(clampedWidth)
  }, [])

  useLayoutEffect(() => {
    const container = treeRef.current?.parentElement
    if (collapsed || !container) {
      return
    }
    const clampToContainer = (): void => {
      setWidth(combinedDiffFileTreeWidthPreference, container.getBoundingClientRect().width)
    }
    clampToContainer()
    const observer = new ResizeObserver(clampToContainer)
    observer.observe(container)
    return () => observer.disconnect()
  }, [collapsed, setWidth])

  useLayoutEffect(
    () => () => {
      activeResizeCleanupRef.current?.()
    },
    []
  )

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (event.button !== 0) {
        return
      }
      const tree = treeRef.current
      const container = tree?.parentElement
      if (!tree || !container) {
        return
      }

      event.preventDefault()
      activeResizeCleanupRef.current?.()
      const handle = event.currentTarget
      const pointerId = event.pointerId
      const previousCursor = document.body.style.cursor
      const previousUserSelect = document.body.style.userSelect
      let cleanedUp = false
      const handlePointerMove = (moveEvent: PointerEvent): void => {
        const treeLeft = tree.getBoundingClientRect().left
        setWidth(moveEvent.clientX - treeLeft, container.getBoundingClientRect().width)
      }
      const cleanup = (): void => {
        if (cleanedUp) {
          return
        }
        cleanedUp = true
        handle.removeEventListener('pointermove', handlePointerMove)
        handle.removeEventListener('pointerup', cleanup)
        handle.removeEventListener('pointercancel', cleanup)
        handle.removeEventListener('lostpointercapture', cleanup)
        if (handle.hasPointerCapture(pointerId)) {
          handle.releasePointerCapture(pointerId)
        }
        document.body.style.cursor = previousCursor
        document.body.style.userSelect = previousUserSelect
        activeResizeCleanupRef.current = null
      }

      activeResizeCleanupRef.current = cleanup
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      handle.setPointerCapture(pointerId)
      handle.addEventListener('pointermove', handlePointerMove)
      handle.addEventListener('pointerup', cleanup)
      handle.addEventListener('pointercancel', cleanup)
      handle.addEventListener('lostpointercapture', cleanup)
    },
    [setWidth]
  )

  const handleResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return
      }
      const containerWidth = treeRef.current?.parentElement?.getBoundingClientRect().width
      if (!containerWidth) {
        return
      }
      event.preventDefault()
      const direction = event.key === 'ArrowLeft' ? -1 : 1
      setWidth(width + direction * COMBINED_DIFF_FILE_TREE_RESIZE_STEP, containerWidth)
    },
    [setWidth, width]
  )

  return { handleResizeKeyDown, handleResizePointerDown, treeRef, width }
}
