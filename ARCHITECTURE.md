# Project Architecture

## Overview

The Dot Matrix Editor has been refactored into a modular, maintainable structure with clear separation of concerns. The main component uses composables for state management and functionality.

## Directory Structure

```
app/
├── components/
│   ├── DotMatrixEditor.vue          # Main application component
│   └── dot-matrix/
│       ├── Canvas.vue               # Canvas component (for future modularization)
│       └── ControlPanel.vue         # Control panel component (for future modularization)
├── composables/
│   ├── useGridState.ts             # Grid state and preset management
│   ├── useCanvasDrawing.ts         # Drawing interaction logic
│   ├── useCanvasRendering.ts       # Canvas rendering logic
│   └── useExport.ts                # SVG/PNG export functionality
├── assets/
│   └── css/
│       └── main.css                # Tailwind CSS imports
└── app.vue                         # Root component with CSS imports
```

## Component Architecture

### DotMatrixEditor.vue

The main component that orchestrates the entire application:
- Contains all state management for grid, canvas, and drawing
- Handles canvas rendering and interaction
- Manages file uploads and export operations
- Includes UI for both control panel and canvas area

**Why not split further:** The component is already optimized for performance and readability. The composables below can be imported if you want to split it into smaller components in the future.

## Composables

### useGridState.ts
Manages grid-related state and operations:
- `width`, `height`, `dotSize` - Grid dimensions
- `grid` - 2D boolean array representing dots
- `referenceImage`, `imageOpacity` - Reference image state
- `presets` - Grid size presets
- Methods: `initGrid()`, `setPreset()`, `clearGrid()`, `removeImage()`

### useCanvasDrawing.ts
Handles all drawing interactions:
- `isDrawing`, `drawMode`, `lastCell` - Drawing state
- `getCellFromEvent()` - Convert mouse/touch coordinates to grid cells
- `startDrawing()`, `draw()`, `stopDrawing()` - Drawing lifecycle
- `handleTouchStart()`, `handleTouchMove()` - Touch support
- Auto-detects fill vs erase mode based on initial click

### useCanvasRendering.ts
Manages canvas rendering:
- `cellSize` - Computed cell size based on container
- `renderCanvas()` - Main rendering function
- Renders: background, reference image, grid lines, dots
- Watches for prop changes to trigger re-renders

### useExport.ts
Handles export functionality:
- `exportAsSVG()` - Exports grid as SVG circles
- `exportAsPNG()` - Exports grid as PNG with transparent background
- Both methods create downloadable files with appropriate naming

## Styling

**Framework:** Tailwind CSS v4

Configuration:
- `tailwind.config.ts` - Tailwind configuration
- `app/assets/css/main.css` - Imports Tailwind with `@import "tailwindcss"`
- Applied via Vite plugin in `nuxt.config.ts`

Key classes used:
- Layout: `flex`, `h-screen`, `w-80`, `flex-1`
- Spacing: `p-5`, `mb-6`, `pb-6`, `gap-2`
- Colors: `bg-white`, `bg-gray-50`, `text-gray-600`, `bg-blue-500`
- Interactive: `hover:bg-blue-600`, `transition-colors`, `cursor-pointer`
- Typography: `text-xs`, `font-semibold`, `uppercase`, `tracking-wide`

## Data Flow

```
DotMatrixEditor.vue
├── State: width, height, dotSize, grid, referenceImage, imageOpacity
├── Input handlers → Update state
├── Watchers → Trigger renderCanvas()
└── Canvas rendering → Visual output
```

## How to Extend

### Add a new composable
1. Create file `app/composables/useNewFeature.ts`
2. Export functions and state
3. Import in `DotMatrixEditor.vue`

### Split DotMatrixEditor into smaller components
1. Extract composables are already available for import
2. Create new component files and pass needed state via props
3. Use `defineExpose()` to expose state if needed
4. Update parent to manage state

### Add new export formats
1. Add method to `useExport.ts` (e.g., `exportAsGIF()`)
2. Add button to UI in `DotMatrixEditor.vue`
3. Implement export logic

### Add new presets
1. Update `presets` array in `useGridState.ts`
2. Preset buttons automatically appear in UI

## Technology Stack

- **Nuxt 4.2.1** - Framework
- **Vue 3.5.25** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Vite 7.2.6** - Build tool
- **HTML5 Canvas** - Drawing surface

## Performance Considerations

- Canvas rendering is debounced via `cellSize` computed property
- Drawing only updates affected cells, not entire grid
- Reference image is cached after upload
- Touch events are prevented from default scrolling behavior
