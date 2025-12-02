<template>
  <div class="dot-matrix-editor">
    <!-- Control Panel -->
    <div class="control-panel">
      <h1>Dot Matrix Icon Creator</h1>
      
      <!-- Resolution Controls -->
      <div class="control-section">
        <h3>Resolution</h3>
        <div class="preset-buttons">
          <button
            v-for="preset in presets"
            :key="preset.name"
            @click="setPreset(preset)"
            :class="{ active: width === preset.width && height === preset.height }"
          >
            {{ preset.name }}
          </button>
        </div>
        <div class="custom-inputs">
          <label>
            Width:
            <input type="number" v-model.number="width" min="1" max="64" />
          </label>
          <label>
            Height:
            <input type="number" v-model.number="height" min="1" max="64" />
          </label>
        </div>
      </div>

      <!-- Dot Size Control -->
      <div class="control-section">
        <h3>Dot Size</h3>
        <input
          type="range"
          v-model.number="dotSize"
          min="0.3"
          max="0.9"
          step="0.05"
        />
        <span>{{ (dotSize * 100).toFixed(0) }}%</span>
      </div>

      <!-- Reference Image Upload -->
      <div class="control-section">
        <h3>Reference Image</h3>
        <input
          type="file"
          @change="handleImageUpload"
          accept="image/*"
          ref="fileInput"
        />
        <div v-if="referenceImage" class="image-controls">
          <label>
            Opacity:
            <input
              type="range"
              v-model.number="imageOpacity"
              min="0"
              max="1"
              step="0.05"
            />
            <span>{{ (imageOpacity * 100).toFixed(0) }}%</span>
          </label>
          <button @click="removeImage">Remove Image</button>
        </div>
      </div>

      <!-- Export Controls -->
      <div class="control-section">
        <h3>Export</h3>
        <button @click="exportAsSVG" class="export-button">Export as SVG</button>
        <button @click="exportAsPNG" class="export-button">Export as PNG</button>
      </div>

      <!-- Clear Grid -->
      <div class="control-section">
        <button @click="clearGrid" class="clear-button">Clear Grid</button>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="canvas-area">
      <div class="canvas-container" ref="canvasContainer">
        <canvas
          ref="canvas"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend.prevent="stopDrawing"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

// Grid state
const width = ref(16);
const height = ref(16);
const dotSize = ref(0.7);
const grid = ref<boolean[][]>([]);

// Reference image state
const referenceImage = ref<HTMLImageElement | null>(null);
const imageOpacity = ref(0.5);
const fileInput = ref<HTMLInputElement | null>(null);

// Canvas refs
const canvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);

// Drawing state
const isDrawing = ref(false);
const drawMode = ref<'fill' | 'erase'>('fill');
const lastCell = ref<{ x: number; y: number } | null>(null);

// Presets
const presets = [
  { name: '8×8', width: 8, height: 8 },
  { name: '16×16', width: 16, height: 16 },
  { name: '24×24', width: 24, height: 24 },
  { name: '32×32', width: 32, height: 32 },
  { name: '48×48', width: 48, height: 48 },
];

// Cell size (canvas will be scaled)
const cellSize = computed(() => {
  if (!canvasContainer.value) return 30;
  const containerWidth = canvasContainer.value.clientWidth;
  const containerHeight = canvasContainer.value.clientHeight;
  const maxWidth = containerWidth / width.value;
  const maxHeight = containerHeight / height.value;
  return Math.min(Math.max(20, Math.min(maxWidth, maxHeight)), 50);
});

// Initialize grid
const initGrid = () => {
  grid.value = Array(height.value)
    .fill(null)
    .map(() => Array(width.value).fill(false));
};

// Set preset
const setPreset = (preset: { width: number; height: number }) => {
  width.value = preset.width;
  height.value = preset.height;
  initGrid();
};

// Handle image upload
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      referenceImage.value = img;
      renderCanvas();
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Remove image
const removeImage = () => {
  referenceImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  renderCanvas();
};

// Clear grid
const clearGrid = () => {
  initGrid();
  renderCanvas();
};

// Get cell coordinates from mouse position
const getCellFromEvent = (event: MouseEvent | Touch): { x: number; y: number } | null => {
  if (!canvas.value) return null;
  const rect = canvas.value.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / cellSize.value);
  const y = Math.floor((event.clientY - rect.top) / cellSize.value);
  if (x >= 0 && x < width.value && y >= 0 && y < height.value) {
    return { x, y };
  }
  return null;
};

// Drawing functions
const startDrawing = (event: MouseEvent) => {
  const cell = getCellFromEvent(event);
  if (!cell) return;
  
  isDrawing.value = true;
  drawMode.value = grid.value[cell.y][cell.x] ? 'erase' : 'fill';
  grid.value[cell.y][cell.x] = drawMode.value === 'fill';
  lastCell.value = cell;
  renderCanvas();
};

const draw = (event: MouseEvent) => {
  if (!isDrawing.value) return;
  const cell = getCellFromEvent(event);
  if (!cell) return;
  
  // Only update if we moved to a different cell
  if (!lastCell.value || cell.x !== lastCell.value.x || cell.y !== lastCell.value.y) {
    grid.value[cell.y][cell.x] = drawMode.value === 'fill';
    lastCell.value = cell;
    renderCanvas();
  }
};

const stopDrawing = () => {
  isDrawing.value = false;
  lastCell.value = null;
};

// Touch support
const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  startDrawing(mouseEvent);
};

const handleTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY,
  });
  draw(mouseEvent);
};

// Render canvas
const renderCanvas = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  canvas.value.width = width.value * cellSize.value;
  canvas.value.height = height.value * cellSize.value;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // Draw grid background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);

  // Draw reference image if available (on top of background)
  if (referenceImage.value) {
    ctx.globalAlpha = imageOpacity.value;
    ctx.drawImage(
      referenceImage.value,
      0,
      0,
      canvas.value.width,
      canvas.value.height
    );
    ctx.globalAlpha = 1;
  }

  // Draw grid lines
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  for (let i = 0; i <= width.value; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize.value, 0);
    ctx.lineTo(i * cellSize.value, canvas.value.height);
    ctx.stroke();
  }
  for (let i = 0; i <= height.value; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize.value);
    ctx.lineTo(canvas.value.width, i * cellSize.value);
    ctx.stroke();
  }

  // Draw dots
  const radius = (cellSize.value * dotSize.value) / 2;
  ctx.fillStyle = '#000';
  for (let y = 0; y < height.value; y++) {
    for (let x = 0; x < width.value; x++) {
      if (grid.value[y][x]) {
        ctx.beginPath();
        ctx.arc(
          x * cellSize.value + cellSize.value / 2,
          y * cellSize.value + cellSize.value / 2,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
};

// Export as SVG
const exportAsSVG = () => {
  const svgWidth = width.value * 10;
  const svgHeight = height.value * 10;
  const radius = (10 * dotSize.value) / 2;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${svgWidth}" height="${svgHeight}" fill="transparent"/>
`;

  for (let y = 0; y < height.value; y++) {
    for (let x = 0; x < width.value; x++) {
      if (grid.value[y][x]) {
        const cx = x * 10 + 5;
        const cy = y * 10 + 5;
        svg += `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="black"/>\n`;
      }
    }
  }

  svg += '</svg>';

  // Download
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dot-matrix-${width.value}x${height.value}.svg`;
  link.click();
  URL.revokeObjectURL(url);
};

// Export as PNG
const exportAsPNG = () => {
  // Create a temporary canvas for export
  const exportCanvas = document.createElement('canvas');
  const scale = 10;
  exportCanvas.width = width.value * scale;
  exportCanvas.height = height.value * scale;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return;

  // Transparent background
  ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Draw dots
  const radius = (scale * dotSize.value) / 2;
  ctx.fillStyle = '#000';
  for (let y = 0; y < height.value; y++) {
    for (let x = 0; x < width.value; x++) {
      if (grid.value[y][x]) {
        ctx.beginPath();
        ctx.arc(
          x * scale + scale / 2,
          y * scale + scale / 2,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // Download
  exportCanvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dot-matrix-${width.value}x${height.value}.png`;
    link.click();
    URL.revokeObjectURL(url);
  });
};

// Watch for changes
watch([width, height], () => {
  initGrid();
  renderCanvas();
});

watch([dotSize, imageOpacity], () => {
  renderCanvas();
});

// Initialize on mount
onMounted(() => {
  initGrid();
  renderCanvas();
  
  // Handle window resize
  window.addEventListener('resize', renderCanvas);
});
</script>

<style scoped>
.dot-matrix-editor {
  display: flex;
  height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.control-panel {
  width: 300px;
  padding: 20px;
  background: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.control-panel h1 {
  font-size: 20px;
  margin: 0 0 20px 0;
  font-weight: 600;
  color: #333;
}

.control-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.control-section:last-child {
  border-bottom: none;
}

.control-section h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.preset-buttons button {
  flex: 1;
  min-width: calc(33% - 6px);
  padding: 8px 12px;
  border: 2px solid #e5e5e5;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.preset-buttons button:hover {
  border-color: #999;
}

.preset-buttons button.active {
  border-color: #007aff;
  background: #007aff;
  color: white;
}

.custom-inputs {
  display: flex;
  gap: 12px;
}

.custom-inputs label {
  flex: 1;
  font-size: 13px;
  color: #666;
}

.custom-inputs input {
  width: 100%;
  margin-top: 4px;
  padding: 8px;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
}

input[type='range'] {
  width: 100%;
  margin-right: 8px;
}

input[type='file'] {
  font-size: 13px;
  width: 100%;
}

.image-controls {
  margin-top: 12px;
}

.image-controls label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.image-controls input[type='range'] {
  width: calc(100% - 50px);
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.export-button {
  width: 100%;
  margin-bottom: 8px;
  background: #007aff;
  color: white;
}

.export-button:hover {
  background: #0051d5;
}

.clear-button {
  width: 100%;
  background: #ff3b30;
  color: white;
}

.clear-button:hover {
  background: #d62e24;
}

.image-controls button {
  width: 100%;
  background: #ff3b30;
  color: white;
}

.image-controls button:hover {
  background: #d62e24;
}

.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: auto;
}

.canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

canvas {
  cursor: crosshair;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background: white;
}

@media (max-width: 768px) {
  .dot-matrix-editor {
    flex-direction: column;
  }

  .control-panel {
    width: 100%;
    max-height: 40vh;
  }

  .canvas-area {
    padding: 20px;
  }
}
</style>
