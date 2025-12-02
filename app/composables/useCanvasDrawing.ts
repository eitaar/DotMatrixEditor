import { ref } from 'vue'
import type { Ref } from 'vue'

export const useCanvasDrawing = (
  canvasRef: Ref<HTMLCanvasElement | null>,
  width: Ref<number>,
  height: Ref<number>,
  cellSize: Ref<number>,
  grid: Ref<boolean[][]>
) => {
  const isDrawing = ref(false)
  const drawMode = ref<'fill' | 'erase'>('fill')
  const lastCell = ref<{ x: number; y: number } | null>(null)

  const getCellFromEvent = (event: MouseEvent | Touch): { x: number; y: number } | null => {
    if (!canvasRef.value) return null
    const rect = canvasRef.value.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / cellSize.value)
    const y = Math.floor((event.clientY - rect.top) / cellSize.value)
    if (x >= 0 && x < width.value && y >= 0 && y < height.value) {
      return { x, y }
    }
    return null
  }

  const startDrawing = (event: MouseEvent) => {
    const cell = getCellFromEvent(event)
    if (!cell) return

    isDrawing.value = true
    drawMode.value = grid.value[cell.y][cell.x] ? 'erase' : 'fill'
    grid.value[cell.y][cell.x] = drawMode.value === 'fill'
    lastCell.value = cell
  }

  const draw = (event: MouseEvent) => {
    if (!isDrawing.value) return
    const cell = getCellFromEvent(event)
    if (!cell) return

    if (!lastCell.value || cell.x !== lastCell.value.x || cell.y !== lastCell.value.y) {
      grid.value[cell.y][cell.x] = drawMode.value === 'fill'
      lastCell.value = cell
    }
  }

  const stopDrawing = () => {
    isDrawing.value = false
    lastCell.value = null
  }

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    startDrawing(mouseEvent)
  }

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
    draw(mouseEvent)
  }

  return {
    isDrawing,
    drawMode,
    lastCell,
    getCellFromEvent,
    startDrawing,
    draw,
    stopDrawing,
    handleTouchStart,
    handleTouchMove,
  }
}

