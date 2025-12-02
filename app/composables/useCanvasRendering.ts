import { watch, computed } from 'vue'
import type { Ref } from 'vue'

export const useCanvasRendering = (
  canvasRef: Ref<HTMLCanvasElement | null>,
  canvasContainerRef: Ref<HTMLDivElement | null>,
  width: Ref<number>,
  height: Ref<number>,
  dotSize: Ref<number>,
  grid: Ref<boolean[][]>,
  referenceImage: Ref<HTMLImageElement | null>,
  imageOpacity: Ref<number>
) => {
  const cellSize = computed(() => {
    if (!canvasContainerRef.value) return 30
    const containerWidth = canvasContainerRef.value.clientWidth
    const containerHeight = canvasContainerRef.value.clientHeight
    const maxWidth = containerWidth / width.value
    const maxHeight = containerHeight / height.value
    return Math.min(Math.max(20, Math.min(maxWidth, maxHeight)), 50)
  })

  const renderCanvas = () => {
    if (!canvasRef.value) return
    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvasRef.value.width = width.value * cellSize.value
    canvasRef.value.height = height.value * cellSize.value

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    // Draw grid background
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

    // Draw reference image if available
    if (referenceImage.value) {
      ctx.globalAlpha = imageOpacity.value
      ctx.drawImage(
        referenceImage.value,
        0,
        0,
        canvasRef.value.width,
        canvasRef.value.height
      )
      ctx.globalAlpha = 1
    }

    // Draw grid lines
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    for (let i = 0; i <= width.value; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize.value, 0)
      ctx.lineTo(i * cellSize.value, canvasRef.value.height)
      ctx.stroke()
    }
    for (let i = 0; i <= height.value; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize.value)
      ctx.lineTo(canvasRef.value.width, i * cellSize.value)
      ctx.stroke()
    }

    // Draw dots
    const radius = (cellSize.value * dotSize.value) / 2
    ctx.fillStyle = '#000'
    for (let y = 0; y < height.value; y++) {
      for (let x = 0; x < width.value; x++) {
        if (grid.value[y][x]) {
          ctx.beginPath()
          ctx.arc(
            x * cellSize.value + cellSize.value / 2,
            y * cellSize.value + cellSize.value / 2,
            radius,
            0,
            Math.PI * 2
          )
          ctx.fill()
        }
      }
    }
  }

  // Watch for changes
  watch([width, height], () => {
    renderCanvas()
  })

  watch([dotSize, imageOpacity], () => {
    renderCanvas()
  })

  return {
    cellSize,
    renderCanvas,
  }
}
