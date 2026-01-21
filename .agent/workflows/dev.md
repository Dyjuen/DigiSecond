---
description: Running development servers and testing
---

# Development Workflow

// turbo-all

## Quick Reference (copy-paste)

| Task | Command |
|------|---------|
| Start web dev | `pnpm dev` |
| Start mobile dev | `cd mobile && npx expo start` |
| Run all tests | `pnpm test` |
| Run specific test | `pnpm test src/server/api/routers/__tests__/listing.test.ts` |
| Type check | `pnpm tsc --noEmit` |
| Lint | `pnpm lint` |
| DB migrate | `pnpm prisma migrate dev --name <name>` |
| DB studio | `pnpm prisma studio` |
| E2E tests | `pnpm test:e2e` |

---

## Start Web Development Server

```bash
pnpm dev
```

Opens at http://localhost:3000

## Start Mobile Development Server

```bash
cd mobile && npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator

## Run All Tests

```bash
pnpm test
```

## Run Backend Tests Only

```bash
pnpm test src/server
```

## Run Web Component Tests

```bash
pnpm test src/components
```

## Run Mobile Tests

```bash
cd mobile && pnpm test
```

## Type Check

```bash
pnpm tsc --noEmit
```

## Lint

```bash
pnpm lint
```

## Database Commands

```bash
# Generate Prisma client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name [migration_name]

# Reset database (DEV ONLY)
pnpm prisma migrate reset

# View database
pnpm prisma studio
```
