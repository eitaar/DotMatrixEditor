<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Control Panel -->
    <div class="w-80 p-5 bg-white shadow-md overflow-y-auto max-h-screen">
      <!-- Title -->
      <h1 class="text-xl font-semibold mb-5 text-gray-800">Dot Matrix Icon Creator</h1>

      <!-- Resolution Section -->
      <div class="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
        <h3 class="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">Resolution</h3>
        
        <!-- Preset Buttons -->
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="preset in presets"
            :key="preset.name"
            @click="setPreset(preset)"
            :class="{
              'bg-blue-500 text-white border-blue-500': width === preset.width && height === preset.height,
              'bg-white text-gray-800 border-gray-300 hover:border-gray-600': !(width === preset.width && height === preset.height)
            }"
            class="flex-1 min-w-[calc(33%-6px)] px-3 py-2 border-2 rounded text-xs font-medium transition-all"
          >
            {{ preset.name }}
          </button>
        </div>

        <!-- Custom Inputs -->
        <div class="flex gap-3">
          <label class="flex-1 text-xs text-gray-600">
            Width:
            <input
              type="number"
              v-model.number="width"
              min="1"
              max="64"
              class="w-full mt-1 px-2 py-2 border-2 border-gray-300 rounded text-sm"
            />
          </label>
          <label class="flex-1 text-xs text-gray-600">
            Height:
            <input
              type="number"
              v-model.number="height"
              min="1"
              max="64"
              class="w-full mt-1 px-2 py-2 border-2 border-gray-300 rounded text-sm"
            />
          </label>
        </div>
      </div>

      <!-- Dot Size Section -->
      <div class="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
        <h3 class="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">Dot Size</h3>
        <div class="flex gap-2 items-center">
          <input
            type="range"
            v-model.number="dotSize"
            min="0.3"
            max="0.9"
            step="0.05"
            class="flex-1"
          />
          <span class="text-sm text-gray-600 min-w-12">{{ (dotSize * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <!-- Reference Image Section -->
      <div class="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
        <h3 class="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">Reference Image</h3>
        <input
          type="file"
          @change="handleImageUpload"
          accept="image/*"
          ref="fileInput"
          class="w-full text-xs mb-3"
        />
        <div v-if="referenceImage" class="space-y-2">
          <label class="block text-xs text-gray-600">
            Opacity:
            <div class="flex gap-2 items-center mt-1">
              <input
                type="range"
                v-model.number="imageOpacity"
                min="0"
                max="1"
                step="0.05"
                class="flex-1"
              />
              <span class="text-sm text-gray-600 min-w-12">{{ (imageOpacity * 100).toFixed(0) }}%</span>
            </div>
          </label>
          <button
            @click="removeImage"
            class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
          >
            Remove Image
          </button>
        </div>
      </div>

      <!-- Export Section -->
      <div class="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
        <h3 class="text-xs font-semibold mb-3 text-gray-600 uppercase tracking-wide">Export</h3>
        <div class="space-y-2">
          <button
            @click="exportAsSVG"
            class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
          >
            Export as SVG
          </button>
          <button
            @click="exportAsPNG"
            class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
          >
            Export as PNG
          </button>
        </div>
      </div>

      <!-- Clear Grid Section -->
      <div>
        <button
          @click="clearGrid"
          class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
        >
          Clear Grid
        </button>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="flex-1 flex items-center justify-center p-10 overflow-auto">
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
            class="cursor-crosshair shadow-lg rounded bg-white"
          ></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

// Grid state
const width = ref(16)
const height = ref(16)
const dotSize = ref(0.7)
const grid = ref<boolean[][]>([])

// Reference image state
const referenceImage = ref<HTMLImageElement | null>(null)
const imageOpacity = ref(0.5)
const fileInput = ref<HTMLInputElement | null>(null)

// Canvas refs
const canvas = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)

// Drawing state
const isDrawing = ref(false)
const drawMode = ref<'fill' | 'erase'>('fill')
const lastCell = ref<{ x: number; y: number } | null>(null)

// Presets
const presets = [
  { name: '8×8', width: 8, height: 8 },
  { name: '16×16', width: 16, height: 16 },
  { name: '24×24', width: 24, height: 24 },
  { name: '32×32', width: 32, height: 32 },
  { name: '48×48', width: 48, height: 48 },
]

// Cell size (canvas will be scaled)
const cellSize = computed(() => {
  if (!canvasContainer.value) return 30
  const containerWidth = canvasContainer.value.clientWidth
  const containerHeight = canvasContainer.value.clientHeight
  const maxWidth = containerWidth / width.value
  const maxHeight = containerHeight / height.value
  return Math.min(Math.max(20, Math.min(maxWidth, maxHeight)), 50)
})

// Initialize grid
const initGrid = () => {
  grid.value = Array(height.value)
    .fill(null)
    .map(() => Array(width.value).fill(false))
}

// Set preset
const setPreset = (preset: { width: number; height: number }) => {
  width.value = preset.width
  height.value = preset.height
  initGrid()
}

// Handle image upload
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      referenceImage.value = img
      renderCanvas()
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Remove image
const removeImage = () => {
  referenceImage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  renderCanvas()
}

// Clear grid
const clearGrid = () => {
  initGrid()
  renderCanvas()
}

// Get cell coordinates from mouse position
const getCellFromEvent = (event: MouseEvent | Touch): { x: number; y: number } | null => {
  if (!canvas.value) return null
  const rect = canvas.value.getBoundingClientRect()
  const x = Math.floor((event.clientX - rect.left) / cellSize.value)
  const y = Math.floor((event.clientY - rect.top) / cellSize.value)
  if (x >= 0 && x < width.value && y >= 0 && y < height.value) {
    return { x, y }
  }
  return null
}

// Drawing functions
const startDrawing = (event: MouseEvent) => {
  const cell = getCellFromEvent(event)
  if (!cell) return

  isDrawing.value = true
  drawMode.value = grid.value[cell.y][cell.x] ? 'erase' : 'fill'
  grid.value[cell.y][cell.x] = drawMode.value === 'fill'
  lastCell.value = cell
  renderCanvas()
}

const draw = (event: MouseEvent) => {
  if (!isDrawing.value) return
  const cell = getCellFromEvent(event)
  if (!cell) return

  if (!lastCell.value || cell.x !== lastCell.value.x || cell.y !== lastCell.value.y) {
    grid.value[cell.y][cell.x] = drawMode.value === 'fill'
    lastCell.value = cell
    renderCanvas()
  }
}

const stopDrawing = () => {
  isDrawing.value = false
  lastCell.value = null
}

// Touch support
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

// Render canvas
const renderCanvas = () => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.value.width = width.value * cellSize.value
  canvas.value.height = height.value * cellSize.value

  // Clear canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // Draw grid background
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // Draw reference image if available
  if (referenceImage.value) {
    ctx.globalAlpha = imageOpacity.value
    ctx.drawImage(
      referenceImage.value,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    )
    ctx.globalAlpha = 1
  }

  // Draw grid lines
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  for (let i = 0; i <= width.value; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cellSize.value, 0)
    ctx.lineTo(i * cellSize.value, canvas.value.height)
    ctx.stroke()
  }
  for (let i = 0; i <= height.value; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * cellSize.value)
    ctx.lineTo(canvas.value.width, i * cellSize.value)
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

// Export as SVG
const exportAsSVG = () => {
  const svgWidth = width.value * 10
  const svgHeight = height.value * 10
  const radius = (10 * dotSize.value) / 2

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${svgWidth}" height="${svgHeight}" fill="transparent"/>
`

  for (let y = 0; y < height.value; y++) {
    for (let x = 0; x < width.value; x++) {
      if (grid.value[y][x]) {
        const cx = x * 10 + 5
        const cy = y * 10 + 5
        svg += `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="black"/>\n`
      }
    }
  }

  svg += '</svg>'

  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `dot-matrix-${width.value}x${height.value}.svg`
  link.click()
  URL.revokeObjectURL(url)
}

// Export as PNG
const exportAsPNG = () => {
  const exportCanvas = document.createElement('canvas')
  const scale = 10
  exportCanvas.width = width.value * scale
  exportCanvas.height = height.value * scale
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height)

  const radius = (scale * dotSize.value) / 2
  ctx.fillStyle = '#000'
  for (let y = 0; y < height.value; y++) {
    for (let x = 0; x < width.value; x++) {
      if (grid.value[y][x]) {
        ctx.beginPath()
        ctx.arc(
          x * scale + scale / 2,
          y * scale + scale / 2,
          radius,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
    }
  }

  exportCanvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dot-matrix-${width.value}x${height.value}.png`
    link.click()
    URL.revokeObjectURL(url)
  })
}

// Watch for changes
watch([width, height], () => {
  initGrid()
  renderCanvas()
})

watch([dotSize, imageOpacity], () => {
  renderCanvas()
})

// Initialize on mount
onMounted(() => {
  initGrid()
  renderCanvas()

  // Handle window resize
  window.addEventListener('resize', renderCanvas)
})
</script>

<style scoped>
</style>
