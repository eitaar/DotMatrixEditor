import { ref, computed } from 'vue'

export const useGridState = () => {
  const width = ref(16)
  const height = ref(16)
  const dotSize = ref(0.7)
  const grid = ref<boolean[][]>([])
  const referenceImage = ref<HTMLImageElement | null>(null)
  const imageOpacity = ref(0.5)

  const presets = [
    { name: '8×8', width: 8, height: 8 },
    { name: '16×16', width: 16, height: 16 },
    { name: '24×24', width: 24, height: 24 },
    { name: '32×32', width: 32, height: 32 },
    { name: '48×48', width: 48, height: 48 },
  ]

  const initGrid = () => {
    grid.value = Array(height.value)
      .fill(null)
      .map(() => Array(width.value).fill(false))
  }

  const setPreset = (preset: { width: number; height: number }) => {
    width.value = preset.width
    height.value = preset.height
    initGrid()
  }

  const clearGrid = () => {
    initGrid()
  }

  const removeImage = () => {
    referenceImage.value = null
  }

  return {
    width,
    height,
    dotSize,
    grid,
    referenceImage,
    imageOpacity,
    presets,
    initGrid,
    setPreset,
    clearGrid,
    removeImage,
  }
}
