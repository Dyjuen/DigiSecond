# Shared TypeScript Types

TypeScript type definitions shared across the application.

## Files

- `database.ts` - Database model types (from Prisma)
- `api.ts` - API request/response types
- `common.ts` - Common utility types

## Note

Most types are inferred from Prisma and tRPC. Only add explicit type files when needed for:
- Types shared between web and mobile
- Complex domain types not covered by Prisma
- Utility types

## Owner

**Backend Developer** - coordinate with frontend
