# Slideshare Downloader

A modern Next.js SaaS starter — beautiful landing page, dark/light mode, and a clean architecture ready for blog content and API integration.

## Tech stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion**
- **Lucide Icons**
- **next-themes** (dark/light mode)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
copy .env.example .env.local

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server (Turbopack) |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | Run ESLint               |

## Project structure

```
src/
├── app/              # Pages & routes (Next.js App Router)
├── components/       # Reusable UI (ui, layout, sections)
├── config/           # App config (navigation, etc.)
├── lib/              # Utilities & API client placeholder
└── types/            # Shared TypeScript types
```

## What's included

- Gradient background + glassmorphism cards
- Animated hero, features, CTA sections
- Mobile-first navbar with menu
- Blog placeholder (`/blog`, `/blog/[slug]`)
- API health route (`/api/health`)
- SEO: metadata, sitemap, robots.txt
- Dark/light theme toggle

## Next steps

1. Wire up the download input to a real API route
2. Add blog content (MDX or a CMS)
3. Deploy to Vercel
