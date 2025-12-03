# dogrod-os

A personal "OS-style" web application with multiple modules.

## Modules

### Gallery
An Unsplash-style photo gallery with:
- Waterfall/masonry grid layout
- Time axis navigation (desktop vertical, mobile horizontal)
- Photo detail view with zoom/pan
- EXIF metadata display
- RGB/Luma histogram visualization

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Library**: HeroUI
- **Database**: Supabase (PostgreSQL)
- **Image Storage**: Cloudflare R2 (via CDN URLs)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Environment Setup

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Routes

- `/` - Home page
- `/gallery` - Photo gallery list
- `/gallery/[photoId]` - Photo detail view

## Project Structure

```
dogrod-os/
├── app/
│   ├── gallery/           # Gallery module
│   │   ├── _components/   # Gallery-specific components
│   │   ├── [photoId]/     # Photo detail page
│   │   ├── layout.tsx     # Gallery layout
│   │   └── page.tsx       # Gallery list page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/
│   ├── gallery/           # Gallery utilities and queries
│   └── supabase/          # Supabase client (server-only)
└── docs/
    └── ai-coding.md       # AI coding guidelines
```

## Documentation

- [AI Coding Guidelines](docs/ai-coding.md) - Guidelines for AI-assisted development

## Development

This project uses AI-assisted coding. See the [AI Coding Guidelines](docs/ai-coding.md) for best practices and security rules.

### Key Principles

1. **Server-first data fetching** - All database queries run on the server
2. **No secrets in client** - Environment variables never exposed to browser
3. **Module isolation** - Each module is self-contained

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [HeroUI Documentation](https://heroui.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Deploy

Deploy on [Vercel](https://vercel.com) or any platform supporting Next.js.

```bash
pnpm build
pnpm start
```
