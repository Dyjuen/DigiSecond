---
name: Backend Developer
description: Guidelines for backend development on DigiSecond marketplace - tRPC, Prisma, Xendit, auth
---

# Backend Developer Skill

## Your Scope

You own the **server-side** of DigiSecond:

```
src/server/           # All tRPC routers, auth, db
prisma/               # Schema and migrations
src/lib/              # Shared utilities
```

---

## Workflow: Adding a New tRPC Procedure

### 1. Check spec.md first

```bash
cat docs/spec.md | grep -A 5 "procedure_name"
```

Ensure the procedure is documented. If not, discuss with team before implementing.

### 2. Write the Zod schema

```typescript
// src/server/api/routers/[domain].ts
import { z } from "zod";

const createListingInput = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  price: z.number().int().min(1000).max(999999999),
  categoryId: z.string().uuid(),
});
```

### 3. Write the test FIRST (TDD)

```typescript
// src/server/api/routers/__tests__/listing.test.ts
describe("listing.create", () => {
  it("should create listing with valid input", async () => {
    // Arrange
    const input = { title: "Test Item", ... };
    
    // Act
    const result = await caller.listing.create(input);
    
    // Assert
    expect(result.id).toBeDefined();
    expect(result.status).toBe("DRAFT");
  });
  
  it("should reject title < 5 chars", async () => {
    await expect(caller.listing.create({ title: "abc", ... }))
      .rejects.toThrow("String must contain at least 5 character(s)");
  });
});
```

### 4. Implement the procedure

```typescript
export const listingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createListingInput)
    .mutation(async ({ ctx, input }) => {
      // Authorization
      if (ctx.session.user.suspended) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      // Rate limiting check
      await checkRateLimit(ctx.session.user.id, "listing.create", 10);
      
      // Business logic
      return ctx.db.listing.create({
        data: {
          ...input,
          sellerId: ctx.session.user.id,
          status: "DRAFT",
        },
      });
    }),
});
```

### 5. Run tests

```bash
pnpm test src/server/api/routers/__tests__/listing.test.ts
```

---

## Workflow: Database Migrations

### 1. Edit schema

```prisma
// prisma/schema.prisma
model Listing {
  id          String   @id @default(uuid())
  title       String
  description String
  price       Int
  // ... add new field here
  newField    String?  @default("")
}
```

### 2. Generate migration

```bash
pnpm prisma migrate dev --name add_new_field_to_listing
```

### 3. Regenerate client

```bash
pnpm prisma generate
```

### 4. Notify frontend devs

Post in team chat: "Migration `add_new_field_to_listing` applied. Sync your DB with `pnpm prisma migrate dev`"

---

## Workflow: Xendit Payment Integration

### 1. Create payment

```typescript
// src/server/api/routers/payment.ts
import Xendit from "xendit-node";

const xendit = new Xendit({ secretKey: env.XENDIT_SECRET_KEY });

export const paymentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ transactionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.db.transaction.findUnique({
        where: { id: input.transactionId },
        include: { listing: true },
      });
      
      // Create Xendit invoice
      const invoice = await xendit.Invoice.createInvoice({
        externalId: transaction.id,
        amount: transaction.amount,
        description: `Purchase: ${transaction.listing.title}`,
        invoiceDuration: 86400, // 24 hours
        successRedirectUrl: `${env.NEXTAUTH_URL}/transactions/${transaction.id}`,
      });
      
      // Save payment record
      return ctx.db.payment.create({
        data: {
          transactionId: transaction.id,
          xenditId: invoice.id,
          status: "PENDING",
          amount: transaction.amount,
        },
      });
    }),
});
```

### 2. Handle webhook

```typescript
// src/app/api/webhooks/xendit/route.ts
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("x-callback-token");
  
  // Verify signature
  if (signature !== env.XENDIT_WEBHOOK_TOKEN) {
    return new Response("Invalid signature", { status: 401 });
  }
  
  const payload = JSON.parse(body);
  
  // Idempotency check
  const existing = await db.payment.findUnique({
    where: { xenditId: payload.id },
  });
  if (existing?.status === "PAID") {
    return new Response("Already processed", { status: 200 });
  }
  
  // Update payment and transaction
  await db.$transaction([
    db.payment.update({
      where: { xenditId: payload.id },
      data: { status: "PAID", paidAt: new Date() },
    }),
    db.transaction.update({
      where: { id: payload.external_id },
      data: { 
        status: "PAID",
        verificationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  
  return new Response("OK", { status: 200 });
}
```

---

## Security Checklist

Before merging any PR:

- [ ] All inputs validated with Zod
- [ ] `protectedProcedure` used for authenticated endpoints
- [ ] Authorization checks (user owns resource)
- [ ] Rate limiting on public/heavy endpoints
- [ ] No raw SQL queries (use Prisma)
- [ ] Secrets in env vars, not code
- [ ] Webhook signatures verified
- [ ] Error messages don't leak internal details

---

## Testing Commands

```bash
# Run all backend tests
pnpm test src/server

# Run specific router tests
pnpm test src/server/api/routers/__tests__/listing.test.ts

# Run with coverage
pnpm test --coverage src/server

# Type check
pnpm tsc --noEmit
```

---

## Debugging

### Check Prisma queries

```typescript
// Enable query logging in development
const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});
```

### Check tRPC errors

```typescript
// src/server/api/trpc.ts
const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    console.error("tRPC Error:", error);
    return shape;
  },
});
```

---

## Coordination with Frontend

- **API changes**: Update `docs/spec.md` first, then implement
- **Breaking changes**: Bump version, notify in team chat
- **New procedures**: Frontend can start mocking while you implement
- **Webhooks**: Test locally with ngrok: `ngrok http 3000`
