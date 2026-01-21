# Utilities Library

Shared utility functions and helpers.

## Files

- `schemas.ts` - Zod validation schemas (shared with mobile)
- `utils.ts` - General utility functions (cn, formatPrice, etc.)
- `upload.ts` - Supabase storage upload helpers
- `rate-limit.ts` - Rate limiting utilities

## Sharing with Mobile

Mobile imports schemas from this directory:
```typescript
import { createListingSchema } from "../../../src/lib/schemas";
```

## Owner

**All developers** - coordinate changes
