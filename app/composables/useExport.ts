import type { Ref } from 'vue'

export const useExport = (
  width: Ref<number>,
  height: Ref<number>,
  dotSize: Ref<number>,
  grid: Ref<boolean[][]>
) => {
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

  return {
    exportAsSVG,
    exportAsPNG,
  }
}
