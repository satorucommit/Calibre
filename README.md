# Calibre — A Working Mechanical Watch Movement

> **An interactive, physics-driven mechanical watch movement simulator and horological laboratory built with React 19, TypeScript, and Vite.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-Procedural_Synthesis-FF6F00)](#web-audio-synthesis)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🧭 Overview

**Calibre** is a high-precision educational simulation of a mechanical watch movement. It demystifies horological mechanics by demonstrating how a purely mechanical engine—without batteries, microchips, or solar cells—stores potential energy, steps up rotational speed through exact mathematical gear ratios, and parcels out elapsed time at **28,800 beats per hour (4 Hz)**.

The application features a dual-experience architecture:
1. **The Interactive Movement Bench**: A synchronized split-stage view pairing an interactive CAD-grade SVG & Canvas movement engine with four curated exploration stations.
2. **The Field Journal & Article Mode**: An in-depth editorial essay dissecting energy storage, gear calculations, escapement mechanics, and the historic evolution of watch calibres.

---

## ✨ Features & Exploration Stations

### 01. Power Reserve & Mainspring Barrel
- **Elastic Energy Storage**: Models the mainspring—a coiled ribbon of spring steel housed inside the toothed barrel drum.
- **Interactive Crown Winding**: Turn the knurled crown to wind the arbor, deforming an Archimedean spiral in real time as tension rises up to a 48-hour power reserve.
- **Procedural Ratchet Audio**: Authentic winding clicks synthesized via the Web Audio API with realistic click-pawl behavior.

### 02. The Going Train & Gear Ratios
- **Speed Multiplication**: Visualizes how slow, high-torque barrel rotation is converted to rapid, low-torque motion through step-up wheel-and-pinion pairs.
- **Mathematical Exactness**: Implements the classic horological ratio:
  $$\text{Center Wheel (64T)} \xrightarrow{8:1} \text{Third Pinion (8L)} \times \text{Third Wheel (60T)} \xrightarrow{7.5:1} \text{Fourth Pinion (8L)} = 60:1$$
  Driving the Fourth Wheel arbor at exactly **1 revolution per minute** to carry the seconds hand.
- **"Break the Watch" Laboratory**: Swap third pinion leaves (e.g., 6-leaf or 12-leaf presets) to witness instantaneous time drift, altered beat frequencies, and seconds hand pacing in real time.

### 03. The Swiss Lever Escapement & Heartbeat
- **60 FPS Canvas Escapement Engine**: Real-time rendering of the Swiss lever escapement:
  - Oscillating balance wheel and hairspring
  - Pallet fork with synthetic ruby impulse pallets (entry and exit stones)
  - Club-tooth escape wheel
- **0.1× Slow-Motion Strobe**: Slows down the oscillation to reveal the three critical escapement phases: **Unlock**, **Impulse**, and **Drop**.
- **Real-Time Acoustics**: Procedurally synthesized mechanical tick-tock audio generated without audio samples.

### 04. Movement Archetypes & Diagnostic Suite
- **Comparative Analysis**: Explores the engineering tradeoffs across three dominant horological movements:
  - **Hand-Wound (Manual)**: Ultra-thin profile, pure mechanical tactile connection, 40–50h reserve.
  - **Automatic (Self-Winding)**: Weighted oscillating rotor, continuous kinetic winding, slightly thicker case.
  - **Quartz (Electronic)**: 32,768 Hz quartz crystal regulator, battery-powered stepper motor, ultimate grab-and-go utility.
- **Diagnostic Diagnostic Quiz**: An interactive 3-question diagnostic tool that evaluates wearing habits, daily rituals, and ergonomic preferences to match users with their ideal movement archetype.

### Additional Highlights
- **Workshop Bench Notes**: A collapsible field journal that records winding events, pinion modifications, and diagnostic matches to `localStorage`.
- **Adaptive Performance Engine**: Monitors frame rates dynamically and scales between `HIGH`, `MEDIUM`, and `LOW` rendering tiers.
- **Inclusive Accessibility**: Full keyboard navigation, `aria-live` screen reader announcements, and native support for `prefers-reduced-motion`.
- **Lenis Normalized Scrolling**: Butter-smooth inertial scrolling coupled with Intersection Observers for section detection.

---

## 📐 Horological Mathematics

Calibre models real physical horology with pure mathematical functions in [`src/engine/gearMath.ts`](file:///c:/Users/VEDANT/Desktop/FRONT%20DEV/Calibre/src/engine/gearMath.ts):

### 1. Center Wheel to Fourth Wheel Ratio
$$\text{Ratio} = \left(\frac{Z_{\text{center}}}{Z_{\text{pinion3}}}\right) \times \left(\frac{Z_{\text{wheel3}}}{Z_{\text{pinion4}}}\right) = \left(\frac{64}{8}\right) \times \left(\frac{60}{8}\right) = 8.0 \times 7.5 = 60.0$$

### 2. Fourth Wheel to Escape Wheel Ratio
$$\text{Ratio}_{\text{escape}} = \frac{Z_{\text{fourth}}}{Z_{\text{pinionEscape}}} = \frac{80}{5} = 16.0$$

### 3. Beats Per Hour (BPH)
$$\text{BPH} = \text{Ratio}_{\text{center} \to \text{fourth}} \times \text{Ratio}_{\text{escape}} \times (2 \times Z_{\text{escapeWheel}}) = 60.0 \times 16.0 \times 30 = 28{,}800 \text{ BPH (4 Hz)}$$

### 4. Drift Calculation
$$\Delta t_{\text{hour}} = \left(\frac{\text{Actual Ratio}}{60.0} - 1\right) \times 60 \text{ minutes}$$

---

## 🏗️ Architecture & Project Structure

```text
Calibre/
├── public/
│   ├── favicon.svg              # Movement balance wheel icon
│   └── icons.svg                # Vector icons
├── src/
│   ├── assets/                  # Static media and brand assets
│   ├── components/
│   │   ├── ArticleMode/
│   │   │   └── ArticleView.tsx  # In-depth editorial essay view
│   │   ├── MovementEngine/
│   │   │   ├── EscapementCanvas.tsx # 60 FPS Canvas escapement simulation
│   │   │   ├── GearTrainSvg.tsx     # Involute gear train vector animation
│   │   │   ├── MainspringBarrel.tsx # Spiral spring tension & barrel drum
│   │   │   ├── MovementViewer.tsx   # Master CAD viewport & viewport switcher
│   │   │   └── WatchDialHands.tsx   # Enamel dial with hour, minute, and second hands
│   │   ├── Navigation/
│   │   │   ├── FieldNotesDrawer.tsx # Collapsible bench notes drawer
│   │   │   └── HeaderBar.tsx        # Navigation bar with audio, fps, and jumps
│   │   └── Stations/
│   │       ├── Station01Winding.tsx    # Power reserve & crown winding
│   │       ├── Station02GearTrain.tsx  # Going train & "Break the Watch"
│   │       ├── Station03Escapement.tsx # Swiss lever escapement & audio
│   │       └── Station04Archetypes.tsx # Horological quiz & archetype breakdown
│   ├── engine/
│   │   ├── audio.ts             # Web Audio API procedural sound synthesizer
│   │   ├── gearMath.ts          # Pure horological math & SVG tooth generators
│   │   ├── gearMath.test.ts     # Vitest suite for calculations & geometry
│   │   └── useMovementStore.ts  # Master movement state hook and loop
│   ├── App.css                  # Component layout styles
│   ├── App.tsx                  # Root application component
│   ├── index.css                # Design system tokens, perlage texture, typography
│   └── main.tsx                 # Entry point
├── index.html                   # HTML template with Google Fonts (Bodoni Moda & IBM Plex)
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite bundler configuration
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component hierarchy, state management, and declarative UI |
| **TypeScript 6** | Strict type safety for mechanical properties and configs |
| **Vite 8** | High-performance build tool and local dev server with HMR |
| **Vitest 5** | Unit testing suite for gear math, SVG paths, and drift formulas |
| **GSAP 3** | Smooth station transitions and crown winding acceleration |
| **Lenis** | Smooth inertia scroll normalization across devices |
| **Web Audio API** | Zero-asset real-time procedural audio synthesis |
| **HTML5 Canvas & SVG** | Sub-pixel gear train rendering and 60 FPS escapement loop |
| **Oxlint** | High-speed Rust-based linting |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or higher)
- npm (version 9.x or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/calibre.git
   cd calibre
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing & Verification

The project includes unit tests validating all horological equations, gear ratios, drift formulas, and SVG path generators:

```bash
# Run test suite once with Vitest
npm test

# Run tests in watch mode
npx vitest

# Run linter
npm run lint

# Compile and produce production build
npm run build
```

---

## 🎨 Design System & Aesthetics

Calibre adheres to a horological design language inspired by traditional Swiss watchmaking ateliers:

- **Enamel Dial (`#F3F1EB`)**: Matte porcelain tones reminiscent of grand feu enamel dials.
- **Blued Steel (`#2D4B8E`)**: Thermal-tempered blued steel used for screws and indicators.
- **Synthetic Corundum (`#B3202E`)**: Ruby gemstone bearings for low-friction jewel pivots.
- **Raw Horological Brass (`#B58A3C`)**: Warm brushed brass plates and wheels.
- **Perlage Finish**: Circular engine-turned engine plate background patterns.
- **Typography**: Elegant editorial serif headings in [*Bodoni Moda*](https://fonts.google.com/specimen/Bodoni+Moda) paired with technical data in [*IBM Plex Sans*](https://fonts.google.com/specimen/IBM+Plex+Sans) and [*IBM Plex Mono*](https://fonts.google.com/specimen/IBM+Plex+Mono).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
