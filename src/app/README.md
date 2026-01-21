# Next.js App Directory

This directory contains Next.js 14 App Router pages and layouts.

## Structure

```
app/
├── (auth)/              # Auth routes (login, register)
│   ├── login/
│   └── register/
├── (main)/              # Main app routes
│   ├── listings/
│   │   ├── [id]/        # Dynamic listing detail page
│   │   └── new/         # Create listing page
│   ├── transactions/
│   │   └── [id]/        # Transaction detail page
│   └── profile/
├── api/
│   ├── trpc/            # tRPC API handler
│   └── webhooks/        # Payment webhooks
├── layout.tsx           # Root layout
└── page.tsx             # Home page
```

## Owner

**Frontend Web Developer** - See `.agent/skills/frontend-web/SKILL.md`
