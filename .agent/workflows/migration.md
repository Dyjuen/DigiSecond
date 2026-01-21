---
description: Database schema changes and migrations
---

# Database Migration Workflow

## 1. Edit Prisma Schema

```bash
code prisma/schema.prisma
```

Add/modify models following spec.md data models.

## 2. Generate Migration

```bash
pnpm prisma migrate dev --name [descriptive_name]
```

Examples:
- `add_auction_fields`
- `create_dispute_table`
- `add_user_verification_columns`

## 3. Regenerate Client

// turbo
```bash
pnpm prisma generate
```

## 4. Update Types

If adding new fields, update corresponding Zod schemas in:
- `src/lib/schemas.ts` (shared)
- `src/server/api/routers/[router].ts` (input validation)

## 5. Notify Team

Post in team chat:
> "Migration `[name]` applied. Sync your DB with `pnpm prisma migrate dev`"

## 6. Mobile Sync

Mobile dev should:
```bash
cd mobile
# No action needed - types shared from web
```

## Rollback (if needed)

```bash
# View migration history
pnpm prisma migrate status

# Rollback last migration (creates new reverse migration)
pnpm prisma migrate resolve --rolled-back [migration_name]
```

## Production Deploy

```bash
# Don't run migrate dev in production!
pnpm prisma migrate deploy
```
