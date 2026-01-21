# tRPC Routers

Type-safe API procedures using tRPC.

## Structure

```
routers/
├── auth.ts              # Authentication procedures
├── user.ts              # User profile procedures
├── listing.ts           # Listing CRUD procedures
├── transaction.ts       # Purchase/verification procedures
├── payment.ts           # Xendit integration procedures
├── dispute.ts           # Dispute procedures
├── message.ts           # Chat procedures
├── review.ts            # Rating procedures
└── __tests__/           # Unit tests for routers
```

## Workflow

1. Check `docs/spec.md` for procedure requirements
2. Write Zod validation schema
3. Write tests FIRST (TDD)
4. Implement procedure
5. Run tests

## Owner

**Backend Developer** - See `.agent/skills/backend/SKILL.md`
