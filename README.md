# Dot Matrix Icon Creator

A web application built with **Nuxt** that replicates the functionality of the "Dot Matrix" Figma plugin. Create pixel-perfect dot matrix icons with circular pixels, reference image overlay, and export to SVG or PNG.

![Dot Matrix Editor](https://github.com/user-attachments/assets/fe62891a-9002-4cb6-aea9-545afd831d1a)

## Features

### ✨ Core Features

- **Resolution Selection**: Choose from preset grid sizes (8×8, 16×16, 24×24, 32×32, 48×48) or set custom width × height
- **Round Pixel Rendering**: Each pixel is rendered as a circular dot, similar to dot-matrix printer output
- **Interactive Drawing**: Click or drag to toggle dots on/off with automatic fill/erase mode detection
- **Dot Size Control**: Adjust the size of dots from 30% to 90% of cell size
- **Touch Support**: Full touch screen support for mobile and tablet devices

### 🖼️ Reference Image Support

- Upload a reference image to trace over
- Display image as a semi-transparent background layer
- Adjustable opacity slider (0-100%)
- Easy image removal

### 📤 Export Options

- **SVG Export**: Vector circles with transparent background, perfect for scalable graphics
- **PNG Export**: High-quality raster image with transparency support
- Automatic file naming based on grid dimensions

### 🎨 User Interface

- Clean, minimalist interface
- Left sidebar control panel with organized sections
- Responsive canvas that adapts to viewport size
- Zoomable grid display
- Grid lines for precise pixel placement
- Visual feedback with hover states and active buttons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Usage

### Creating Icons

1. **Set Resolution**: Choose a preset size or enter custom dimensions
2. **Draw**: Click or drag on the grid to toggle dots on/off
   - First click determines mode (fill empty cells or erase filled cells)
   - Drag to draw continuously
3. **Adjust Dot Size**: Use the slider to make dots larger or smaller
4. **Clear Grid**: Use the "Clear Grid" button to start over

### Using Reference Images

1. Click "Choose File" under Reference Image section
2. Select an image from your computer
3. The image will appear behind the grid at 50% opacity
4. Adjust opacity with the slider to your preference
5. Trace over the image by clicking dots on the grid
6. Remove the image when done with "Remove Image" button

### Exporting

- **Export as SVG**: Vector format, ideal for logos and scalable graphics
- **Export as PNG**: Raster format with transparency, ready for use

Files are automatically downloaded with names like `dot-matrix-16x16.svg` or `dot-matrix-32x32.png`

## Technology Stack

- **Framework**: Nuxt 4.2.1
- **UI Library**: Vue 3.5.25
- **Language**: TypeScript

## Browser Support

Works on all modern browsers with HTML5 Canvas support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
