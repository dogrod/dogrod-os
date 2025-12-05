# AI Coding Guidelines for dogrod-os

This document outlines how AI-assisted coding is used in the dogrod-os project, coding expectations, and security guidelines.

## Overview

dogrod-os is a personal "OS-style" web application with multiple modules (Gallery, Blog, Resume, etc.). AI coding assistants are used to accelerate development while maintaining code quality and security.

## Modules Using AI Coding

### Gallery Module
- **Location**: `app/gallery/`
- **Scope**: Frontend only (UI components, data display, navigation)
- **Data Source**: Supabase database via server-side queries
- **Status**: MVP complete

### Future Modules
- Blog
- Resume
- Settings
- (Others as needed)

---

## Coding Expectations for AI Changes

### 1. Code Style and Conventions

- **TypeScript**: All code must be written in TypeScript with proper type definitions
- **Naming**: Use camelCase for variables/functions, PascalCase for components/types
- **File Structure**: 
  - Components in `_components/` folders within their module
  - Shared utilities in `lib/`
  - Types co-located with their domain (`lib/gallery/types.ts`)
- **Imports**: Use path aliases (`@/lib/...`) for cleaner imports

### 2. Component Guidelines

- **Server vs Client**: Default to Server Components; use `"use client"` only when necessary
- **Props**: Define explicit interfaces for all component props
- **Accessibility**: Include proper ARIA labels, keyboard navigation, and alt text
- **Error Handling**: Always handle loading, error, and empty states

### 3. Shared Utilities

Reuse existing utilities when available:
- `lib/supabase/server.ts` - Supabase client (server-only)
- `lib/gallery/types.ts` - Type definitions
- `lib/gallery/utils.ts` - Formatting utilities
- `lib/gallery/queries.ts` - Database queries

### 4. Module Isolation

- Keep module-specific code within its directory (`app/gallery/`)
- Only move code to shared locations (`lib/`) if truly generic
- Avoid cross-module dependencies unless necessary

### 5. Testing

- Add tests for critical business logic
- Test edge cases (empty data, missing fields, errors)
- Verify accessibility with keyboard navigation

---

## Security Rules

### Critical Rules (Never Break)

1. **No Secrets in Client Code**
   - Never use `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or any secret in client components
   - All environment variables with secrets must only be accessed in server code
   - Use the `"server-only"` package to enforce this

2. **No Direct Database Access from Client**
   - All Supabase queries must go through Server Components, Server Actions, or Route Handlers
   - Client components receive pre-fetched data as props

3. **No Committed Secrets**
   - Never commit `.env` files or hardcoded credentials
   - Use `.env.local` (gitignored) for local development
   - Use environment variables in deployment platforms

4. **Input Validation**
   - Validate all user inputs on the server side
   - Sanitize data before database operations
   - Use parameterized queries (Supabase handles this)

### Architecture Pattern

```
[Client Component] 
    ↓ (props only)
[Server Component]
    ↓ (server-only import)
[lib/supabase/server.ts]
    ↓ (SUPABASE_URL, SUPABASE_ANON_KEY)
[Supabase Database]
```

---

## Writing AI Prompts for dogrod-os

### Required Information

When requesting AI assistance, always include:

1. **Module Name**: Which module (Gallery, Blog, etc.)
2. **Scope**: Frontend, backend, or both
3. **Expected Behavior**: What should happen from user perspective
4. **Constraints**: Technical limitations or requirements

### Prompt Template

```
## Task: [Brief description]

### Module
[Module name] - [frontend/backend/both]

### Current State
[What exists now]

### Expected Behavior
[What should happen after changes]

### Constraints
- [Technical constraint 1]
- [Technical constraint 2]

### Files to Modify
- [file path 1]
- [file path 2]
```

### Example Prompts

#### Adding a Filter to Gallery

```
## Task: Add tag filtering to Gallery list page

### Module
Gallery - frontend

### Current State
Gallery shows all public photos in a waterfall grid.

### Expected Behavior
- Add a tag filter dropdown above the grid
- When a tag is selected, only show photos with that tag
- Preserve filter state when navigating back from detail page
- Clear filter option to show all photos

### Constraints
- Use HeroUI Select component
- Fetch available tags server-side
- Don't expose database credentials to client
```

#### Changing Layout Behavior

```
## Task: Change photo grid to show 6 columns on ultra-wide screens

### Module
Gallery - frontend

### Current State
Grid shows max 5 columns on 2xl screens.

### Expected Behavior
- Add 6 column layout for screens >= 1536px
- Maintain smooth transitions between breakpoints

### Constraints
- Use Tailwind CSS breakpoints
- Maintain performance with lazy loading

### Files to Modify
- app/gallery/_components/PhotoGrid.tsx
```

#### Fixing a Bug

```
## Task: Fix histogram not rendering for some photos

### Module
Gallery - frontend

### Current State
Histogram shows "unavailable" for photos that have histogram data.

### Expected Behavior
- Histogram should render when photo_histogram data exists
- Only show "unavailable" when data is truly missing

### Debug Info
- Photo ID: abc-123
- Has histogram in database: yes
- Canvas renders: no

### Files to Modify
- app/gallery/_components/Histogram.tsx
```

---

## Project Structure Reference

```
dogrod-os/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── providers.tsx           # Client providers (HeroUI)
│   ├── globals.css             # Global styles
│   ├── page.tsx                # Home page
│   └── gallery/
│       ├── layout.tsx          # Gallery layout with header
│       ├── page.tsx            # List page (server)
│       ├── [photoId]/
│       │   └── page.tsx        # Detail page (server)
│       └── _components/
│           ├── GalleryHeader.tsx
│           ├── PhotoGrid.tsx
│           ├── PhotoCard.tsx
│           ├── TimeAxis.tsx
│           ├── TimeAxisMobile.tsx
│           ├── PhotoViewer.tsx
│           ├── PhotoDetailClient.tsx
│           ├── ExifInfo.tsx
│           ├── Histogram.tsx
│           └── BlurhashImage.tsx
├── lib/
│   ├── supabase/
│   │   └── server.ts           # Server-only Supabase client
│   └── gallery/
│       ├── index.ts            # Re-exports
│       ├── types.ts            # Type definitions
│       ├── utils.ts            # Formatting utilities
│       ├── queries.ts          # Database queries
│       └── actions.ts          # Server actions
├── docs/
│   └── ai-coding.md            # This document
└── public/
    └── ...                     # Static assets
```

---

## Checklist for AI Changes

Before submitting AI-generated code:

- [ ] No secrets or credentials in client code
- [ ] All database calls are server-side
- [ ] TypeScript types are properly defined
- [ ] Components handle loading/error/empty states
- [ ] Accessibility: keyboard nav, ARIA labels, alt text
- [ ] Code follows existing patterns and conventions
- [ ] Changes are scoped to the relevant module
- [ ] No unnecessary dependencies added

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12 | 1.0.0 | Initial Gallery module MVP |



