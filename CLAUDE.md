# Portfolio – Full Visual Redesign

## Stack
- CRA React 19, plain CSS (migrating to Tailwind)
- framer-motion, gsap, @gsap/react installed
- Tailwind CSS installed with color variables plugin
- Aceternity UI: copy-paste from ui.aceternity.com/components into src/components/ui/
- cn() utility at src/utils/cn.js
- Space/night theme — shooting stars background in ShootingStars.css

## Run
npm start → localhost:3000

## Vision
Jaw-dropping. Moving. Atmospheric. Space theme throughout.
Think: aurora backgrounds, 3D card tilt on hover, magnetic cursor,
scroll-triggered staggered reveals, glowing text effects, depth and parallax.
NOT: subtle tweaks, border changes, small hover effects.

## Aceternity components that fit this project
- Aurora Background → wrap entire app background
- Sparkles → hero/name section  
- Text Generate Effect → section headings
- 3D Card Effect → Projects cards
- Tracing Beam → scroll guide down the page
- Moving Border → skill badges
- Background Beams → Experience section
- Lamp Effect → section headers
- Infinite Moving Cards → skills/publications

## Rebuild order
1. Background system (Aurora + enhanced shooting stars)
2. Hero/name area (Sparkles + Text Generate)  
3. Projects (3D Card Effect + Card Hover)
4. Experience (Background Beams)
5. Skills (Moving Border badges + Infinite scroll)
6. Sidebar (animated nav)

## Rules
- Full rebuilds only — no patching
- One component per session
- Tailwind for all new code
- Framer Motion for component animations
- GSAP ScrollTrigger for scroll sequences
- Never touch utils/ or workers/
- Confirm npm start after every change
- Commit after every successful change
