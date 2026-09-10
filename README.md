# Studio Chitkala - Landing Page

A premium, interactive landing page designed and developed for **Studio Chitkala**. This website features smooth scroll animations, custom SVG interactions, and a fully responsive layout to showcase the studio's portfolio, art gallery, and creative services.

## Features

- **Dynamic Animations**: Custom GSAP-like scroll reveals, crossfading backgrounds, and smooth interactive UI elements.
- **Interactive SVG Hand Flowers**: An immersive hero section where flowers emerge from a hand SVG and respond to user hovers with interactive info tickets.
- **Premium Postcard Form**: A specialized multi-step contact form designed as a vintage postcard that dynamically changes backgrounds based on the current step.
- **Fully Responsive**: Carefully crafted for both desktop and mobile experiences.
- **Modern Tech Stack**: Built with Next.js (App Router), React, TypeScript, and modern Vanilla CSS.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Uoerim/chitkala_landing.git
   ```
2. Navigate into the project directory:
   ```bash
   cd chitkala_landing
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

By default, this project is configured to generate a **Static Export** when you run `npm run build`. This generates static HTML/CSS/JS files in the `out` directory, which can be deployed to any static host.

If you need a standard Next.js build (e.g. for deployment on Vercel or a Node.js server), you must modify `next.config.ts`.

#### Option 1: Static Export (Current default)
Use this if you are hosting on a static file server (like GitHub Pages, AWS S3, or cPanel).

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
```
*Run `npm run build` to output to the `/out` directory.*

#### Option 2: Standard Next.js Build
Use this if you are deploying to Vercel, Netlify, or running a Node server.

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Removed or commented out
  // images unoptimization is optional here
};

export default nextConfig;
```
*Run `npm run build` then `npm start` to run the production server.*

## Structure Overview
- `src/app/page.tsx` - Main landing page layout.
- `src/app/globals.css` - Custom styling and design system.
- `src/app/HandFlowers.tsx` - Interactive flower hover animations component.
- `src/app/ScrollTextReveal.tsx` - Smooth text reveal effect tied to scroll position.
- `src/app/PostcardForm.tsx` - Multi-step interactive contact form.
- `public/` - Static assets including SVGs, images, and fonts.
