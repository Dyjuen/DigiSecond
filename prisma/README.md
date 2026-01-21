# Prisma Schema

This directory contains the Prisma ORM configuration and database schema.

## Files

- `schema.prisma` - Database models and configuration

## Usage

```bash
# Generate Prisma client after schema changes
pnpm prisma generate

# Create and apply migrations
pnpm prisma migrate dev --name <migration_name>

# Open Prisma Studio (visual database browser)
pnpm prisma studio
```

## Owner

**Backend Developer** - See `.agent/skills/backend/SKILL.md`
