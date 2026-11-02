# Carrom Portfolio 🎯

An interactive 3D Carrom board portfolio website built with **React**, **Three.js** (`@react-three/fiber`), and **Matter.js**.

Personal portfolio of **Monish Pandian D** — IT Student, Full-Stack Developer, and AI/ML Enthusiast.

---

## 🌟 Highlights & Features

- **3D Board Experience**: Rendered using Three.js and `@react-three/fiber` for an immersive interactive experience.
- **2D Physics Engine**: Fast and accurate collision physics powered by `Matter.js` handling striker placement, aiming lines, flicking power, cushion bouncing, and pocketing.
- **Interactive Portfolio Content**:
  - **Projects**: Showcase of full-stack and machine learning applications.
  - **Certifications**: Verified credentials (e.g., Oracle Agentic AI Associate, DeepLearning.AI Supervised Machine Learning).
  - **Skills**: Categorized technical stacks (Languages, Frontend, Backend, Tools, CS Fundamentals).
  - **Experience & Education**: Academic background, hackathons, and competitive programming achievements.
- **Accessible Dual View**: Easily toggle between the interactive 3D carrom game and a clean, responsive **List View** for standard reading.
- **Responsive Design**: Polished UI with custom styles, responsive layouts, and modal overlays.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **3D Graphics**: Three.js, `@react-three/fiber`
- **Physics**: Matter.js
- **Styling**: Bootstrap 5, Custom CSS
- **Testing**: Node.js physics test suite (`scripts/test-physics.mjs`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Monish-Pandian/Portfolio.git
   cd Portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Run the physics tests:
   ```bash
   npm run test:physics
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
├── public/
│   └── media/            # Certificate images and media assets
├── scripts/
│   └── test-physics.mjs  # Physics engine test suite
├── src/
│   ├── components/       # UI overlays, navigation, and list view
│   ├── data/             # Portfolio content and profile configuration
│   ├── physics/          # Matter.js carrom physics implementation
│   ├── three/            # Three.js board scene, shaders, and textures
│   ├── App.jsx           # Root application component
│   ├── main.jsx          # Vite entrypoint
│   └── styles.css        # Core styling
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

