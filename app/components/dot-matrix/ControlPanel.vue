<template>
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
        @click="clearGridHandler"
        class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
      >
        Clear Grid
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGridState } from '../../composables/useGridState'
import { useExport } from '../../composables/useExport'

const {
  width,
  height,
  dotSize,
  grid,
  referenceImage,
  imageOpacity,
  presets,
  setPreset,
  clearGrid: clearGridComposable,
  removeImage: removeImageFromState,
} = useGridState()

const { exportAsSVG, exportAsPNG } = useExport(width, height, dotSize, grid)

const fileInput = ref<HTMLInputElement | null>(null)

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      referenceImage.value = img
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  removeImageFromState()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const clearGridHandler = () => {
  clearGridComposable()
}

defineExpose({
  width,
  height,
  dotSize,
  grid,
  referenceImage,
  imageOpacity,
})
</script>
