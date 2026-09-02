# Portfolio Rebuild — Deep Shahane

## Mission
This is NOT a redesign. This is a complete rebuild from scratch.
Forget the existing components. We are building something new.

## Person
- Name: Deep Shahane
- Has an in-browser LLM (WebGPU powered) — this is the most unique thing on the portfolio
- Space/dark theme is the identity — keep it

## The vision
Think: first time someone saw an Apple product demo.
Not "nice portfolio" — "how did they build that?"

Reference points:
- https://linear.app (motion, atmosphere, depth)
- https://stripe.com (scroll storytelling)
- https://vercel.com (dark, technical, confident)

## Tech stack for the rebuild
- React 19 (keep existing)
- framer-motion (installed)
- gsap + @gsap/react (installed)  
- Tailwind CSS (installed)
- 21st.dev Magic MCP — use /ui to generate components
- Aceternity UI components where needed

## What to build
1. Full-screen cinematic hero — name, title, animated tagline, the LLM feature front and center
2. Scroll-driven narrative — sections reveal as stories, not as cards
3. Projects — each project gets a moment, not a card in a grid
4. Experience — timeline with depth, not a list
5. Skills — motion, not badges
6. The Ask/LLM section — make this the showstopper, it's genuinely unique

## Rules
- Start fresh. Do not import or reference old component files.
- Use /ui [description] to generate components via 21st.dev Magic
- Use Tailwind for all styling
- Framer Motion for all animations
- GSAP ScrollTrigger for scroll sequences
- Keep the WebLLM worker files untouched (utils/ and workers/)
- Commit after each section is complete
