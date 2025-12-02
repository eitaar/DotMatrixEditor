<template>
  <div class="flex items-center justify-center w-full h-full">
    <div ref="canvasContainer" class="flex items-center justify-center w-full h-full">
      <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="stopDrawing"
        class="cursor-crosshair shadow-lg rounded"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { Ref } from 'vue'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  dotSize: { type: Number, required: true },
  grid: { type: Array as () => boolean[][], required: true },
  referenceImage: { type: [Object, null] as any, required: true },
  imageOpacity: { type: Number, required: true },
})

const canvas = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const isDrawing = ref(false)
const drawMode = ref<'fill' | 'erase'>('fill')
const lastCell = ref<{ x: number; y: number } | null>(null)

const cellSize = computed(() => {
  if (!canvasContainer.value) return 30
  const containerWidth = canvasContainer.value.clientWidth
  const containerHeight = canvasContainer.value.clientHeight
  const maxWidth = containerWidth / props.width
  const maxHeight = containerHeight / props.height
  return Math.min(Math.max(20, Math.min(maxWidth, maxHeight)), 50)
})

const renderCanvas = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  canvas.value.width = props.width * cellSize.value
  canvas.value.height = props.height * cellSize.value

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  if (props.referenceImage) {
    ctx.globalAlpha = props.imageOpacity
    ctx.drawImage(
      props.referenceImage,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    )
    ctx.globalAlpha = 1
  }

  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  for (let i = 0; i <= props.width; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cellSize.value, 0)
    ctx.lineTo(i * cellSize.value, canvas.value.height)
    ctx.stroke()
  }
  for (let i = 0; i <= props.height; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * cellSize.value)
    ctx.lineTo(canvas.value.width, i * cellSize.value)
    ctx.stroke()
  }

  const radius = (cellSize.value * props.dotSize) / 2
  ctx.fillStyle = '#000'
  for (let y = 0; y < props.height; y++) {
    for (let x = 0; x < props.width; x++) {
      if (props.grid[y][x]) {
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

const getCellFromEvent = (event: MouseEvent | Touch): { x: number; y: number } | null => {
  if (!canvas.value) return null
  const rect = canvas.value.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) / cellSize.value)
  const y = Math.floor((event.clientY - rect.top) / cellSize.value)
  if (x >= 0 && x < props.width && y >= 0 && y < props.height) {
    return { x, y }
  }
  return null
}

const startDrawing = (event: MouseEvent) => {
  const cell = getCellFromEvent(event)
  if (!cell) return

  isDrawing.value = true
  drawMode.value = props.grid[cell.y][cell.x] ? 'erase' : 'fill'
  props.grid[cell.y][cell.x] = drawMode.value === 'fill'
  lastCell.value = cell
  renderCanvas()
}

const draw = (event: MouseEvent) => {
  if (!isDrawing.value) return
  const cell = getCellFromEvent(event)
  if (!cell) return

  if (!lastCell.value || cell.x !== lastCell.value.x || cell.y !== lastCell.value.y) {
    props.grid[cell.y][cell.x] = drawMode.value === 'fill'
    lastCell.value = cell
    renderCanvas()
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

watch(() => [props.width, props.height, props.dotSize, props.imageOpacity], () => {
  renderCanvas()
}, { deep: true })

onMounted(() => {
  renderCanvas()
  window.addEventListener('resize', renderCanvas)
})
</script>

<style scoped>
canvas {
  background: white;
}
</style>
