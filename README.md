# Notion Clone

A production-ready Notion clone built with modern web technologies. No AI, no telemetry.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Clerk
- **State:** Zustand + TanStack Query
- **Editor:** TipTap
- **Drag & Drop:** dnd-kit
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (for auth)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for required variables.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   ├── (main)/            # Authenticated pages
│   │   └── documents/     # Document pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home (redirects)
│   ├── loading.tsx        # Global loading
│   ├── error.tsx          # Error boundary
│   └── not-found.tsx      # 404 page
├── components/
│   ├── layout/            # Layout components (sidebar, nav)
│   ├── providers/         # Context providers
│   ├── ui/                # shadcn/ui components
│   └── shared/            # Shared/reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configuration
├── stores/                # Zustand stores
├── styles/                # Global CSS
└── types/                 # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run type-check` | TypeScript check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

## Architecture Decisions

- **App Router** for server components and streaming
- **Server Actions** for mutations (coming soon)
- **Optimistic updates** via TanStack Query
- **Prisma** for type-safe database access
- **Zustand** for client-side UI state (sidebar, editor)
- **TanStack Query** for server state (documents, data)
- **TipTap** for the block editor (extensible, headless)
- **Clerk** for zero-config auth with webhooks
- **shadcn/ui** for accessible, customizable components

## License

Private use only.
